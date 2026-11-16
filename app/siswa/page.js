'use client';
import { useState } from 'react';
import { api, useGuard } from '../../lib/api';
import { bookCols, loanCols } from '../../lib/config';
import Navbar from '../../components/Navbar';
import DataTable from '../../components/DataTable';
import Tabs from '../../components/Tabs';
import { btn } from '../../lib/ui';

export default function Siswa() {
  const [s, logout] = useGuard('siswa');
  const [tab, setTab] = useState('books');
  if (!s) return null;
  const tabs = {
    books: ['Katalog buku', <DataTable key="b" title="Katalog buku" hint="Cari judul, penulis, atau penerbit" path="/books" cols={bookCols}
      extra={(r, h) => <button className={btn('solid', 'sm')} disabled={r.stock < 1} onClick={h.run(() => api('POST', '/loans', { book_id: r.id }), 'Buku dipinjam, kembalikan dalam 7 hari')}>Pinjam</button>} />],
    loans: ['Pinjaman saya', <DataTable key="l" title="Pinjaman saya" hint="Cari judul buku" path="/loans" cols={loanCols(false)}
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
