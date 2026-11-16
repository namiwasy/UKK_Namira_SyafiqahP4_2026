'use client';
import { btn, input, label } from '../lib/ui';

export default function FormModal({ title, fields, init = {}, onSave, onClose }) {
  return (
    <dialog ref={el => { if (el && !el.open) el.showModal(); }} onClose={onClose}
      className="m-auto w-[min(420px,92vw)] rounded-3xl border-[1.5px] border-pink bg-cream p-6 text-ink backdrop:bg-ink/40 backdrop:backdrop-blur-sm">
      <form onSubmit={e => { e.preventDefault(); onSave(Object.fromEntries(new FormData(e.target))); }}>
        <h3 className="mb-2 text-[26px]">{title}</h3>
        {fields.map(([k, l, t]) => (
          <label key={k} className={label}>{l}
            {Array.isArray(t)
              ? <select name={k} className={input}>{t.map(([v, n]) => <option key={v} value={v}>{n}</option>)}</select>
              : <input name={k} type={t || 'text'} min={t === 'number' ? 0 : undefined} defaultValue={init[k] ?? ''} className={input} />}
          </label>
        ))}
        <div className="mt-5 flex justify-end gap-2.5">
          <button type="button" className={btn('ghost')} onClick={onClose}>Batal</button>
          <button className={btn()}>Simpan</button>
        </div>
      </form>
    </dialog>
  );
}
