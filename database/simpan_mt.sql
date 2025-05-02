-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 02 Bulan Mei 2025 pada 15.44
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `simpan_mt`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `kuis`
--

CREATE TABLE `kuis` (
  `id` int(11) NOT NULL,
  `judul` varchar(255) DEFAULT NULL,
  `deskripsi` text DEFAULT NULL,
  `gambar` varchar(255) DEFAULT 'default.jpg'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `kuis`
--

INSERT INTO `kuis` (`id`, `judul`, `deskripsi`, `gambar`) VALUES
(1, 'kfhkjdf', 'asdjfnajksfd', ''),
(2, 'kfhkjdf', 'asdjfnajksfd', 'logo.png'),
(3, 'wnedjkwednkjwe', 'dnwwjkednjkwe', 'forum3.jpeg'),
(4, 'wnedjkwednkjwe', 'dnwwjkednjkwe', 'forum3.jpeg'),
(5, 'kkdkdkdkdkkdkdkkdkdkkkkdkdk', 'kdkdkkmkdemi', 'english.jpeg'),
(6, 'kljlkfjkjfd', 'jj', 'forum3.jpeg');

-- --------------------------------------------------------

--
-- Struktur dari tabel `materi`
--

CREATE TABLE `materi` (
  `id` int(11) NOT NULL,
  `judul` varchar(255) DEFAULT NULL,
  `deskripsi` text DEFAULT NULL,
  `isi_materi` text DEFAULT NULL,
  `gambar` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `materi`
--

INSERT INTO `materi` (`id`, `judul`, `deskripsi`, `isi_materi`, `gambar`) VALUES
(2, 'Pemrograman Dasar', 'Pelajari konsep-konsep fundamental yang menjadi pondasi dalam dunia pemrograman', 'Pengenalan Variabel\r\nPelajari konsep dasar variabel dalam pemrograman, tipe data, dan cara pendeklarasiannya dalam berbagai bahasa pemrograman.\r\n\r\nStruktur Kontrol\r\nMemahami percabangan (if-else) dan perulangan (for, while) sebagai dasar logika pemrograman.\r\n\r\nFungsi dan Prosedur\r\nKonsep modularisasi kode dengan fungsi dan prosedur untuk membuat program yang lebih terstruktur.\r\n\r\nStruktur Data Dasar\r\nPengenalan array, list, dan struktur data sederhana lainnya untuk pengelolaan data.\r\n\r\nDebugging Dasar\r\nTeknik identifikasi dan perbaikan kesalahan umum dalam kode pemrograman.\r\n\r\nBest Practices\r\nPola penulisan kode yang baik dan prinsip-prinsip dasar clean code untuk pemula.', 'program.jpeg'),
(3, 'Design Web', 'Kuasaikan prinsip-prinsip desain visual dan alat kreatif untuk mengekspresikan ide-ide Anda', 'Prinsip Desain\r\nPelajari prinsip dasar desain seperti kontras, keseimbangan, hierarki, dan kesatuan untuk menciptakan karya visual yang efektif.\r\n\r\nTeori Warna\r\nMemahami psikologi warna, skema warna, dan bagaimana memilih kombinasi warna yang harmonis untuk desain Anda.\r\n\r\nTipografi\r\nPengenalan jenis font, pairing font, dan teknik penggunaan tipografi untuk meningkatkan komunikasi visual.\r\n\r\nKomposisi\r\nTeknik pengaturan elemen visual seperti rule of thirds, golden ratio, dan focal point untuk desain yang menarik.\r\n\r\nSoftware Tools\r\nPengenalan tools desain grafis populer seperti Adobe Photoshop, Illustrator, dan Figma beserta kegunaannya.\r\n\r\nFormat File\r\nMemahami perbedaan format file gambar (JPG, PNG, SVG, AI) dan kapan menggunakannya.', 'web.jpeg'),
(4, 'Manajemen Proyek', 'Pelajari metodologi dan praktik terbaik untuk mengelola proyek secara efektif dan efisien.', 'Dasar Manajemen Proyek\r\nMemahami konsep dasar, prinsip, dan metodologi dalam manajemen proyek modern.\r\n\r\nPerencanaan Proyek\r\nTeknik menyusun rencana proyek yang efektif termasuk scope, timeline, dan alokasi sumber daya.\r\n\r\nManajemen Tim\r\nStrategi membangun dan memimpin tim proyek yang produktif dan kolaboratif.\r\n\r\nMonitoring & Evaluasi\r\nTeknik memantau progres proyek dan mengevaluasi kinerja terhadap target yang ditetapkan.\r\n\r\nManajemen Risiko\r\nIdentifikasi, analisis, dan mitigasi risiko potensial dalam pelaksanaan proyek.\r\n\r\nPelaporan Proyek\r\nPenyusunan laporan proyek yang efektif untuk berbagai stakeholder.\r\n', 'project.jpeg'),
(11, 'sd', 'as', 'fdjskdfjssd', 'data.jpeg');

-- --------------------------------------------------------

--
-- Struktur dari tabel `soal`
--

CREATE TABLE `soal` (
  `id` int(11) NOT NULL,
  `id_kuis` int(11) DEFAULT NULL,
  `pertanyaan` text DEFAULT NULL,
  `opsi_a` text DEFAULT NULL,
  `opsi_b` text DEFAULT NULL,
  `opsi_c` text DEFAULT NULL,
  `opsi_d` text DEFAULT NULL,
  `jawaban_benar` char(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `soal`
--

INSERT INTO `soal` (`id`, `id_kuis`, `pertanyaan`, `opsi_a`, `opsi_b`, `opsi_c`, `opsi_d`, `jawaban_benar`) VALUES
(1, 1, '', '', '', '', '', ''),
(2, 2, '', '', '', '', '', ''),
(3, 3, 'wdjknwjkedjwe', 'jjdwnkjwed', 'dewjknwjked', 'wndjend', 'jkdenjend', 'A'),
(4, 4, 'wdjknwjkedjwe', 'jjdwnkjwed', 'dewjknwjked', 'wndjend', 'jkdenjend', 'A'),
(5, 5, 'cdc', 'c', 'dd', 'cd', 'dd', 's'),
(6, 6, 'jhjk', 'jkh', 'j', 'h', 'h', 'A');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `kuis`
--
ALTER TABLE `kuis`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `materi`
--
ALTER TABLE `materi`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `soal`
--
ALTER TABLE `soal`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_kuis` (`id_kuis`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `kuis`
--
ALTER TABLE `kuis`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `materi`
--
ALTER TABLE `materi`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT untuk tabel `soal`
--
ALTER TABLE `soal`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `soal`
--
ALTER TABLE `soal`
  ADD CONSTRAINT `soal_ibfk_1` FOREIGN KEY (`id_kuis`) REFERENCES `kuis` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
