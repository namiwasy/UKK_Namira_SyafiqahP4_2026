'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, getSession, setSession } from '../lib/api';
import { btn, input, label } from '../lib/ui';

const steps = [
  ['Cari buku', 'Telusuri katalog berdasarkan judul, penulis, atau penerbit, lengkap dengan info stok.'],
  ['Pinjam', 'Satu klik untuk meminjam. Stok berkurang otomatis dan jatuh tempo diatur 7 hari.'],
  ['Kembalikan', 'Kembalikan dari halaman “Pinjaman saya”. Terlambat dikenakan denda Rp1.000 per hari.'],
];

export default function Home() {
  const router = useRouter();
  const [tab, setTab] = useState('siswa'), [err, setErr] = useState(''), [ok, setOk] = useState('');
  const reg = tab === 'daftar';

  useEffect(() => { const s = getSession(); if (s) router.replace(s.user.role === 'admin' ? '/admin' : '/siswa'); }, []);

  const submit = async e => {
    e.preventDefault(); setErr(''); setOk('');
    const body = Object.fromEntries(new FormData(e.target));
    try {
      if (reg) { await api('POST', '/register', body); setTab('siswa'); setOk('Akun dibuat. Silakan masuk.'); return; }
      const r = await api('POST', '/login', { ...body, role: tab });
      setSession(r); router.push(r.user.role === 'admin' ? '/admin' : '/siswa');
    } catch (er) { setErr(er.message); }
  };

  return (
    <>
      <section className="hero-bg bg-pink px-[6vw] pb-14">
        <header className="flex items-center justify-between py-5">
          <a href="/" className="font-display text-[26px] text-olive">Pustaka<em className="italic text-hot">ku</em></a>
          <span className="rounded-full bg-hot px-4 py-1 text-[13px] text-white">Perpustakaan sekolah digital</span>
        </header>
        <div className="mx-auto mt-5 grid max-w-[1100px] items-center gap-10 md:grid-cols-[1.1fr_1fr]">
          <div>
            <h1 className="text-[clamp(40px,6vw,64px)] leading-[1.02]">Baca yang kamu suka, pinjam <em className="italic text-hot">tanpa antre</em></h1>
            <p className="mt-4 max-w-[460px]">Cari buku, pinjam, dan kembalikan dari satu tempat. Admin perpustakaan mencatat semuanya otomatis, termasuk stok dan denda.</p>
          </div>
          <div className="rounded-[46px] bg-cream p-2.5 shadow-[0_0_0_8px_rgba(255,255,255,.55),0_0_0_10px_#fff]">
            <div className="rounded-[38px] bg-white px-7 py-6">
              <div className="flex gap-1.5 rounded-full bg-blush p-1">
                {[['siswa', 'Siswa'], ['admin', 'Admin'], ['daftar', 'Daftar']].map(([k, l]) => (
                  <button key={k} type="button" onClick={() => { setTab(k); setErr(''); setOk(''); }}
                    className={`flex-1 rounded-full py-1.5 text-sm font-medium transition ${tab === k ? 'bg-hot text-white' : 'text-olive'}`}>{l}</button>
                ))}
              </div>
              <form onSubmit={submit} key={tab} className="mt-2">
                {reg && <>
                  <label className={label}>Nama lengkap<input name="name" required className={input} /></label>
                  <label className={label}>Kelas<input name="kelas" placeholder="contoh: XII RPL 1" className={input} /></label>
                </>}
                <label className={label}>Email<input name="email" type="email" required autoComplete="email" className={input} /></label>
                <label className={label}>Password<input name="password" type="password" required autoComplete={reg ? 'new-password' : 'current-password'} className={input} /></label>
                <div className="min-h-[22px] text-[13px] text-olive">{err ? <span className="text-[#b3365f]">{err}</span> : ok}</div>
                <button className={`${btn()} mt-1.5 w-full`}>{reg ? 'Buat akun' : 'Masuk'}</button>
              </form>
            </div>
          </div>
        </div>
      </section>
      <div className="lace-pink h-3.5" />
      <section className="px-[6vw] pb-12 pt-11 text-center">
        <h2 className="text-[32px]">Tiga langkah meminjam</h2>
        <div className="mx-auto mt-6 grid max-w-[1000px] gap-5 md:grid-cols-3">
          {steps.map(([t, d], i) => (
            <article key={t} className="rounded-[26px] bg-matcha p-6 text-left">
              <span className="mb-2 inline-grid h-[30px] w-[30px] place-items-center rounded-full bg-olive text-[13px] text-white">{i + 1}</span>
              <h3 className="text-[22px]">{t}</h3>
              <p className="mt-1.5 text-sm">{d}</p>
            </article>
          ))}
        </div>
      </section>
      <div className="lace-green h-3.5" />
      <footer className="flex flex-wrap items-center justify-between gap-3 bg-matcha px-[6vw] py-6 text-[13px] text-olive">
        <a href="/" className="font-display text-[26px] text-olive">Pustaka<em className="italic text-hot">ku</em></a>
        <span>Admin: admin@perpus.id / admin123 · Siswa: andi@siswa.id / siswa123</span>
      </footer>
    </>
  );
}
