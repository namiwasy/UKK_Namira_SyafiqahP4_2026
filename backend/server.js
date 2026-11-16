require('dotenv').config();
const express = require('express'), cors = require('cors'), mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs'), jwt = require('jsonwebtoken');

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost', port: +(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root', password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'perpustakaan_app', dateStrings: true, connectionLimit: 10,
});
const SECRET = process.env.JWT_SECRET || 'rahasia', DENDA = +(process.env.DENDA || 1000);
const app = express();
app.use(cors()); app.use(express.json());

const E = (s, m) => Object.assign(new Error(m), { status: s });
const like = q => '%' + (q || '') + '%';
const h = fn => (req, res) => fn(req, res).catch(e => {
  if (e.code === 'ER_DUP_ENTRY') e = E(409, 'Email sudah terdaftar');
  if (!e.status) console.error(e);
  res.status(e.status || 500).json({ error: e.status ? e.message : 'Kesalahan server: ' + e.message });
});
const auth = role => (req, res, next) => {
  try { req.user = jwt.verify((req.headers.authorization || '').slice(7), SECRET); }
  catch { return res.status(401).json({ error: 'Silakan login terlebih dahulu' }); }
  if (role && req.user.role !== role) return res.status(403).json({ error: 'Khusus admin' });
  next();
};
async function tx(fn) {
  const c = await db.getConnection();
  try { await c.beginTransaction(); const r = await fn(c); await c.commit(); return r; }
  catch (e) { await c.rollback(); throw e; } finally { c.release(); }
}
async function addSiswa({ name, email, password, kelas }) {
  if (!name || !email || !password) throw E(400, 'Lengkapi nama, email, dan password');
  await db.query("INSERT INTO users(name,email,password,role,kelas) VALUES(?,?,?,'siswa',?)", [name, email, await bcrypt.hash(password, 10), kelas || null]);
}

// ---- Auth
app.post('/api/register', h(async (req, res) => { await addSiswa(req.body); res.status(201).json({ ok: true }); }));
app.post('/api/login', h(async (req, res) => {
  const { email, password, role } = req.body;
  const [[u]] = await db.query('SELECT * FROM users WHERE email=?', [email]);
  if (!u || !(await bcrypt.compare(password || '', u.password))) throw E(401, 'Email atau password salah');
  if (role && role !== u.role) throw E(403, `Akun ini bukan akun ${role}`);
  const user = { id: u.id, name: u.name, role: u.role };
  res.json({ token: jwt.sign(user, SECRET, { expiresIn: '8h' }), user });
}));

// ---- Buku
const bookData = b => {
  if (!b.title || b.stock === '' || b.stock == null || b.stock < 0) throw E(400, 'Judul dan stok (0 atau lebih) wajib diisi');
  return [b.title, b.author || null, b.publisher || null, b.year || null, b.stock];
};
app.get('/api/books', auth(), h(async (req, res) => {
  const q = like(req.query.q);
  res.json((await db.query('SELECT * FROM books WHERE title LIKE ? OR author LIKE ? OR publisher LIKE ? ORDER BY title', [q, q, q]))[0]);
}));
app.post('/api/books', auth('admin'), h(async (req, res) => {
  await db.query('INSERT INTO books(title,author,publisher,`year`,stock) VALUES(?,?,?,?,?)', bookData(req.body)); res.status(201).json({ ok: true });
}));
app.put('/api/books/:id', auth('admin'), h(async (req, res) => {
  await db.query('UPDATE books SET title=?,author=?,publisher=?,`year`=?,stock=? WHERE id=?', [...bookData(req.body), req.params.id]); res.json({ ok: true });
}));
app.delete('/api/books/:id', auth('admin'), h(async (req, res) => { await db.query('DELETE FROM books WHERE id=?', [req.params.id]); res.json({ ok: true }); }));

// ---- Anggota (users siswa)
app.get('/api/users', auth('admin'), h(async (req, res) => {
  const q = like(req.query.q);
  res.json((await db.query("SELECT id,name,email,kelas FROM users WHERE role='siswa' AND (name LIKE ? OR email LIKE ? OR kelas LIKE ?) ORDER BY name", [q, q, q]))[0]);
}));
app.post('/api/users', auth('admin'), h(async (req, res) => { await addSiswa(req.body); res.status(201).json({ ok: true }); }));
app.put('/api/users/:id', auth('admin'), h(async (req, res) => {
  const { name, email, kelas, password } = req.body;
  await db.query("UPDATE users SET name=?,email=?,kelas=? WHERE id=? AND role='siswa'", [name, email, kelas || null, req.params.id]);
  if (password) await db.query('UPDATE users SET password=? WHERE id=?', [await bcrypt.hash(password, 10), req.params.id]);
  res.json({ ok: true });
}));
app.delete('/api/users/:id', auth('admin'), h(async (req, res) => { await db.query("DELETE FROM users WHERE id=? AND role='siswa'", [req.params.id]); res.json({ ok: true }); }));

// ---- Peminjaman (loans). Denda dihitung DENDA per hari keterlambatan.
const FINE = `IF(l.status='dipinjam',GREATEST(DATEDIFF(CURDATE(),l.due_date),0)*${DENDA},l.fine)`;
app.get('/api/loans', auth(), h(async (req, res) => {
  const q = like(req.query.q), own = req.user.role === 'admin' ? '1=1' : 'l.user_id=' + db.escape(req.user.id);
  res.json((await db.query(`SELECT l.id,l.user_id,l.book_id,u.name,b.title,l.loan_date,l.due_date,l.returned_at,l.status,${FINE} AS fine
    FROM loans l JOIN users u ON u.id=l.user_id JOIN books b ON b.id=l.book_id
    WHERE ${own} AND (b.title LIKE ? OR u.name LIKE ?) ORDER BY l.id DESC`, [q, q]))[0]);
}));
app.post('/api/loans', auth(), h(async (req, res) => {
  const uid = req.user.role === 'admin' ? req.body.user_id : req.user.id, bid = req.body.book_id;
  if (!uid || !bid) throw E(400, 'Pilih anggota dan buku');
  await tx(async c => {
    const [u] = await c.query('UPDATE books SET stock=stock-1 WHERE id=? AND stock>0', [bid]);
    if (!u.affectedRows) throw E(400, 'Stok buku habis');
    await c.query("INSERT INTO loans(user_id,book_id,loan_date,due_date,status) VALUES(?,?,CURDATE(),DATE_ADD(CURDATE(),INTERVAL 7 DAY),'dipinjam')", [uid, bid]);
  });
  res.status(201).json({ ok: true });
}));
app.put('/api/loans/:id', auth('admin'), h(async (req, res) => {
  if (!req.body.due_date) throw E(400, 'Tanggal jatuh tempo wajib diisi');
  await db.query('UPDATE loans SET due_date=? WHERE id=?', [req.body.due_date, req.params.id]); res.json({ ok: true });
}));
app.put('/api/loans/:id/return', auth(), h(async (req, res) => {
  await tx(async c => {
    const [[l]] = await c.query('SELECT * FROM loans WHERE id=? FOR UPDATE', [req.params.id]);
    if (!l || (req.user.role !== 'admin' && l.user_id !== req.user.id)) throw E(404, 'Transaksi tidak ditemukan');
    if (l.status !== 'dipinjam') throw E(400, 'Buku sudah dikembalikan');
    await c.query("UPDATE loans SET status='dikembalikan',returned_at=CURDATE(),fine=GREATEST(DATEDIFF(CURDATE(),due_date),0)*? WHERE id=?", [DENDA, l.id]);
    await c.query('UPDATE books SET stock=stock+1 WHERE id=?', [l.book_id]);
  });
  res.json({ ok: true });
}));
app.delete('/api/loans/:id', auth('admin'), h(async (req, res) => {
  await tx(async c => {
    const [[l]] = await c.query('SELECT * FROM loans WHERE id=?', [req.params.id]);
    if (l && l.status === 'dipinjam') await c.query('UPDATE books SET stock=stock+1 WHERE id=?', [l.book_id]);
    await c.query('DELETE FROM loans WHERE id=?', [req.params.id]);
  });
  res.json({ ok: true });
}));

(async () => {
  try {
    const [r] = await db.query("SELECT id FROM users WHERE role='admin' LIMIT 1");
    if (!r.length) await db.query("INSERT INTO users(name,email,password,role) VALUES('Administrator','admin@perpus.id',?,'admin')", [await bcrypt.hash('admin123', 10)]);
  } catch (e) { console.error('Database belum siap. Import backend/data/perpustakaan.sql di phpMyAdmin.\n', e.message); }
})();
app.listen(process.env.PORT || 5000, () => console.log('Backend jalan di http://localhost:' + (process.env.PORT || 5000)));
