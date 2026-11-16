import './globals.css';
export const metadata = { title: 'Pustakaku — Perpustakaan Digital', description: 'Peminjaman buku sekolah berbasis web' };
export default function RootLayout({ children }) {
  return <html lang="id"><body>{children}</body></html>;
}
