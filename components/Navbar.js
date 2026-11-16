import { btn } from '../lib/ui';

export default function Navbar({ user, onLogout }) {
  return (
    <header className="flex items-center gap-4 bg-pink px-[6vw] py-4">
      <a href="/" className="font-display text-[26px] text-olive">Pustaka<em className="italic text-hot">ku</em></a>
      <span className="ml-auto text-sm">{user.name}<small className="ml-1.5 text-hot">{user.role}</small></span>
      <button className={btn('ghost', 'sm')} onClick={onLogout}>Keluar</button>
    </header>
  );
}
