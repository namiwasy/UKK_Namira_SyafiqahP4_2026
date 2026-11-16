'use client';
import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { btn, input, card } from '../lib/ui';
import FormModal from './FormModal';

// Tabel serba guna: cari, tambah, ubah, hapus. `extra` = tombol tambahan per baris.
export default function DataTable({ title, hint, path, cols, fields, editFields, add, edit, del, onAdd, extra }) {
  const [q, setQ] = useState(''), [rows, setRows] = useState(null), [m, setM] = useState(null), [toast, setToast] = useState('');
  const say = t => { setToast(t); setTimeout(() => setToast(''), 2400); };
  const load = useCallback(() => api('GET', `${path}?q=${encodeURIComponent(q)}`).then(setRows).catch(e => { setRows([]); say(e.message); }), [path, q]);
  useEffect(() => { load(); }, [load]);

  const run = (fn, msg) => async () => { try { await fn(); say(msg); load(); } catch (e) { say(e.message); } };
  const form = (t, f, init, fn) => setM({ title: t, fields: f, init, onSave: async v => { try { await fn(v); setM(null); say('Tersimpan'); load(); } catch (e) { say(e.message); } } });
  const h = { run, form };
  const empty = txt => <tr><td colSpan="9" className="p-8 text-center text-olive/70">{txt}</td></tr>;

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h2 className="mr-auto text-[32px]">{title}</h2>
        <input className={`${input} !mt-0 w-full sm:w-[300px]`} placeholder={hint} value={q} onChange={e => setQ(e.target.value)} />
        {add && <button className={btn()} onClick={() => (onAdd ? onAdd(h) : form('Tambah ' + title.toLowerCase(), fields, {}, v => api('POST', path, v)))}>Tambah</button>}
      </div>
      <div className={card}>
        <table className="w-full border-collapse">
          <thead>
            <tr>{cols.map(c => <th key={c[0]} className="border-b-[1.5px] border-pink px-2.5 py-3 text-left text-[13px] font-medium text-olive">{c[1]}</th>)}<th className="border-b-[1.5px] border-pink" /></tr>
          </thead>
          <tbody>
            {rows === null ? empty('Memuat…') : rows.length ? rows.map(r => (
              <tr key={r.id} className="hover:bg-blush/40">
                {cols.map(c => <td key={c[0]} className="whitespace-nowrap border-b border-blush px-2.5 py-3">{c[2] ? c[2](r[c[0]], r) : (r[c[0]] ?? '-')}</td>)}
                <td className="whitespace-nowrap border-b border-blush px-2.5 py-3">
                  <div className="flex justify-end gap-1.5">
                    {extra && extra(r, h)}
                    {edit && <button className={btn('ghost', 'sm')} onClick={() => form('Ubah data', editFields || fields, r, v => api('PUT', `${path}/${r.id}`, v))}>Ubah</button>}
                    {del && <button className={btn('danger', 'sm')} onClick={() => confirm('Hapus data ini?') && run(() => api('DELETE', `${path}/${r.id}`), 'Dihapus')()}>Hapus</button>}
                  </div>
                </td>
              </tr>
            )) : empty('Belum ada data yang cocok.')}
          </tbody>
        </table>
      </div>
      {m && <FormModal {...m} onClose={() => setM(null)} />}
      {toast && <div className="fixed bottom-5 right-5 z-50 rounded-full bg-olive px-5 py-2.5 text-white shadow-lg">{toast}</div>}
    </section>
  );
}
