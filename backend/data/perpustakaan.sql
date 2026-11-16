CREATE DATABASE IF NOT EXISTS perpustakaan_app CHARACTER SET utf8mb4;
USE perpustakaan_app;
DROP TABLE IF EXISTS loans;
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  role ENUM('admin','siswa') NOT NULL DEFAULT 'siswa',
  kelas VARCHAR(20) NULL
);
CREATE TABLE books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  author VARCHAR(100),
  publisher VARCHAR(100),
  `year` INT,
  stock INT NOT NULL DEFAULT 0
);
CREATE TABLE loans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  loan_date DATE NOT NULL,
  due_date DATE NOT NULL,
  returned_at DATE NULL,
  status ENUM('dipinjam','dikembalikan') NOT NULL DEFAULT 'dipinjam',
  fine INT NOT NULL DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);
INSERT INTO users (name, email, password, role, kelas) VALUES
('Administrator','admin@perpus.id','$2b$10$Zk3Lm9QwErTyUiOpAsDfGe7/pQoO/qGjT/lDmGELy7lfzYmnmcqVq','admin',NULL),
('Andi Pratama','andi@siswa.id','$2b$10$Qw8ErTy2UiOpAsDfGhJkLuS/JWDmAjZTzcGJF522sCztj60U1zaRS','siswa','XII RPL 1'),
('Siti Aisyah','siti@siswa.id','$2b$10$Qw8ErTy2UiOpAsDfGhJkLuS/JWDmAjZTzcGJF522sCztj60U1zaRS','siswa','XII RPL 1'),
('Budi Santoso','budi@siswa.id','$2b$10$Qw8ErTy2UiOpAsDfGhJkLuS/JWDmAjZTzcGJF522sCztj60U1zaRS','siswa','XI RPL 2');

INSERT INTO books (title, author, publisher, `year`, stock) VALUES
('Laskar Pelangi','Andrea Hirata','Bentang Pustaka',2005,4),
('Bumi','Tere Liye','Gramedia',2014,3),
('Filosofi Teras','Henry Manampiring','Kompas',2018,4),
('Clean Code','Robert C. Martin','Prentice Hall',2008,1),
('Algoritma dan Pemrograman','Rinaldi Munir','Informatika',2016,6);

-- Contoh transaksi (tanggal relatif terhadap hari import)
INSERT INTO loans (user_id, book_id, loan_date, due_date, returned_at, status, fine) VALUES
(2, 1, DATE_SUB(CURDATE(), INTERVAL 3 DAY),  DATE_ADD(CURDATE(), INTERVAL 4 DAY),  NULL, 'dipinjam', 0),
(3, 4, DATE_SUB(CURDATE(), INTERVAL 10 DAY), DATE_SUB(CURDATE(), INTERVAL 3 DAY),  NULL, 'dipinjam', 0),
(4, 2, DATE_SUB(CURDATE(), INTERVAL 14 DAY), DATE_SUB(CURDATE(), INTERVAL 7 DAY),  DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'dikembalikan', 2000);

-- Akun contoh:  admin@perpus.id / admin123   |   andi@siswa.id, siti@siswa.id, budi@siswa.id / siswa123
