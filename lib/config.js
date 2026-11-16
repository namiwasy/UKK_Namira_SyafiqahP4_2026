// Kolom & isian form untuk tiap tabel (sesuai ERD: Book, Loan, User)
export const rp = n => (n > 0 ? 'Rp ' + Number(n).toLocaleString('id-ID') : '-');
const today = () => new Date().toISOString().slice(0, 10);

export const bookCols = [['title', 'Judul'], ['author', 'Penulis'], ['publisher', 'Penerbit'], ['year', 'Tahun'], ['stock', 'Stok']];
export const bookFields = [['title', 'Judul'], ['author', 'Penulis'], ['publisher', 'Penerbit'], ['year', 'Tahun terbit', 'number'], ['stock', 'Stok', 'number']];
export const userCols = [['name', 'Nama'], ['email', 'Email'], ['kelas', 'Kelas']];
export const userFields = [['name', 'Nama lengkap'], ['email', 'Email', 'email'], ['kelas', 'Kelas'], ['password', 'Password (kosongkan jika tidak diubah)', 'password']];

export const loanCols = admin => [
  ...(admin ? [['name', 'Anggota']] : []),
  ['title', 'Buku'], ['loan_date', 'Dipinjam'], ['due_date', 'Jatuh tempo'], ['returned_at', 'Kembali'],
  ['status', 'Status', (v, r) => {
    const s = v === 'dipinjam' && r.due_date < today() ? 'terlambat' : v;
    const c = { dipinjam: 'bg-pink text-[#9b2c55]', terlambat: 'bg-hot text-white', dikembalikan: 'bg-matcha text-olive' }[s];
    return <span className={`rounded-full px-3 py-0.5 text-xs ${c}`}>{s}</span>;
  }],
  ['fine', 'Denda', v => rp(v)],
];
