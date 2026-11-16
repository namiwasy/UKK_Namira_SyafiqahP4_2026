'use client';
import { useState } from 'react';
import { api, useGuard } from '../../lib/api';
import { bookCols, bookFields, userCols, userFields, loanCols } from '../../lib/config';
import Navbar from '../../components/Navbar';
import DataTable from '../../components/DataTable';
import Tabs from '../../components/Tabs';
import { btn } from '../../lib/ui';

export default function Admin() {
  const [s, logout] = useGuard('admin');
  const [tab, setTab] = useState('books');
  if (!s) return null;

  const addLoan = async h => {
    const [u, b] = await Promise.all([api('GET', '/users'), api('GET', '/books')]);
    h.form('Tambah transaksi', [
      ['user_id', 'Anggota', u.map(x => [x.id, `${x.name} (${x.kelas || '-'})`])],
      ['book_id', 'Buku', b.filter(x => x.stock > 0).map(x => [x.id, `${x.title} (stok ${x.stock})`])],
    ], {}, v => api('POST', '/loans', v));
  };

  const tabs = {
    books: ['Data buku', <DataTable key="b" title="Data buku" hint="Cari judul, penulis, atau penerbit" path="/books" cols={bookCols} fields={bookFields} add edit del />],
    users: ['Anggota', <DataTable key="u" title="Anggota" hint="Cari nama, email, atau kelas" path="/users" cols={userCols} fields={userFields} add edit del />],
    loans: ['Transaksi', <DataTable key="l" title="Transaksi" hint="Cari judul buku atau nama anggota" path="/loans" cols={loanCols(true)}
      editFields={[['due_date', 'Jatuh tempo', 'date']]} add edit del onAdd={addLoan}
      extra={(r, h) => r.status === 'dipinjam' && <button className={btn('solid', 'sm')} onClick={h.run(() => api('PUT', `/loans/${r.id}/return`), 'Buku dikembalikan')}>Kembalikan</button>} />],
  };
  return (
    <>
      <Navbar user={s.user} onLogout={logout} />
      <main className="mx-auto max-w-[1100px] px-[5vw] pb-16 pt-7">
        <Tabs tabs={tabs} tab={tab} setTab={setTab} />
        {tabs[tab][1]}
      </main>
    </>
  );
}
