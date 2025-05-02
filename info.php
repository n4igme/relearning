<?php
include 'koneksi.php';
?>



<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>E-Learning Platform</title>
  <!-- Bootstrap 5 CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <!-- Bootstrap Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet">
  <!-- Chart.js CSS -->
  <link href="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.min.css" rel="stylesheet">
  <!-- DataTables CSS -->
  <link href="https://cdn.datatables.net/1.13.6/css/dataTables.bootstrap5.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body><link rel="stylesheet" href="info.css">

<!-- Navbar -->
<nav class="navbar navbar-expand-lg navbar-custom">
  <div class="container-fluid">
    <!-- Hamburger Menu -->
    <button class="btn btn-outline-light me-2" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasSidebar" aria-controls="offcanvasSidebar" aria-label="Toggle sidebar">
      <i class="bi bi-list" style="font-size: 1.5rem;"></i>
    </button>

    <!-- Logo -->
    <a class="navbar-brand d-flex align-items-center" href="info.php">
      <img src="images/logo.png" alt="Learnfy Logo" width="55" height="55" class="me-2">
      Learnfy
    </a>

    <!-- Mobile Toggler -->
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>

    <!-- Main Menu -->
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav me-auto">
        <li class="nav-item">
          <a class="nav-link" href="#" aria-current="page"><i class="bi bi-house-door me-1"></i> Beranda</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#Daftar Materi"><i class="bi bi-journal-text me-1"></i> Materi</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#Daftar Kuis"><i class="bi bi-question-circle me-1"></i> Kuis</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#Daftar Diskusi"><i class="bi bi-chat-dots me-1"></i> Diskusi</a>
        </li>
      </ul>

      <!-- Profile Dropdown -->
      <div class="dropdown me-3">
        <a href="#" class="nav-link dropdown-toggle" id="profileDropdown" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Profile menu">
          <i class="bi bi-person-circle"></i>
        </a>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
          <li><a class="dropdown-item" href="index.php"><i class="bi bi-person me-2"></i> Profil</a></li>
          <li><a class="dropdown-item" href="#"><i class="bi bi-gear me-2"></i> Pengaturan</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item" href="index.php"><i class="bi bi-box-arrow-in-right me-2"></i> Login</a></li>
          <li><a class="dropdown-item" href="logout.php"><i class="bi bi-box-arrow-right me-2"></i> Logout</a></li>
        </ul>
      </div>

      <!-- Search Bar -->
      <form class="d-flex search-bar" role="search">
        <input class="form-control me-2" type="search" placeholder="Cari..." aria-label="Search">
        <button class="btn btn-outline-light" type="submit" aria-label="Search"><i class="bi bi-search"></i></button>
      </form>
    </div>
  </div>
</nav>

<!-- Sidebar Offcanvas -->
<div class="offcanvas offcanvas-start sidebar" tabindex="-1" id="offcanvasSidebar" aria-labelledby="offcanvasSidebarLabel">
  <div class="offcanvas-header">
    <h5 class="offcanvas-title" id="offcanvasSidebarLabel"><i class="bi bi-bar-chart me-2"></i>Statistik & Menu</h5>
    <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
  </div>
  <div class="offcanvas-body">
    <!-- Quiz Statistics -->
    <div class="mb-4">
      <h3 class="h5"><i class="bi bi-bar-chart me-2"></i>Statistik Kuis</h3>
      <div id="quizChartContainer">
        <canvas id="quizChart"></canvas>
      </div>
    </div>
    <hr>

    <!-- Learning Progress -->
    <div class="mb-4">
      <h3 class="h5"><i class="bi bi-graph-up me-2"></i>Progress Belajar</h3>
      <div class="progress mb-3">
        <div class="progress-bar" role="progressbar" style="width: 75%;" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">75%</div>
      </div>
    </div>
    <hr>

    <!-- Upcoming Assignments -->
    <div class="mb-4">
      <h3 class="h5"><i class="bi bi-calendar-check me-2"></i>Tugas Mendatang</h3>
      <ul class="list-unstyled">
        <li class="mb-2">
          <a href="#" class="text-decoration-none d-flex align-items-start">
            <i class="bi bi-file-earmark-text me-2 mt-1"></i>
            <span>Tugas Pemrograman Dasar<br><small class="text-muted">Deadline: 25 November 2023</small></span>
          </a>
        </li>
        <li class="mb-2">
          <a href="#" class="text-decoration-none d-flex align-items-start">
            <i class="bi bi-file-earmark-text me-2 mt-1"></i>
            <span>Kuis Desain Grafis<br><small class="text-muted">Deadline: 30 November 2023</small></span>
          </a>
        </li>
      </ul>
    </div>
    <hr>

    <!-- Leaderboard -->
    <div class="mb-4">
      <h3 class="h5"><i class="bi bi-trophy me-2"></i>Leaderboard</h3>
      <ol class="list-unstyled">
        <li class="mb-2"><i class="bi bi-1-circle-fill text-warning me-2"></i>User1 - 95 Poin</li>
        <li class="mb-2"><i class="bi bi-2-circle-fill text-secondary me-2"></i>User2 - 90 Poin</li>
        <li class="mb-2"><i class="bi bi-3-circle-fill text-danger me-2"></i>User3 - 88 Poin</li>
      </ol>
    </div>
    <hr>

    <!-- Recommended Materials -->
    <div class="mb-4">
      <h3 class="h5"><i class="bi bi-book me-2"></i>Rekomendasi Materi</h3>
      <ul class="list-unstyled">
        <li class="mb-2">
          <a href="#" class="text-decoration-none d-flex align-items-start">
            <i class="bi bi-file-earmark-text me-2 mt-1"></i>
            <span>Belajar Data Science untuk Pemula</span>
          </a>
        </li>
        <li class="mb-2">
          <a href="#" class="text-decoration-none d-flex align-items-start">
            <i class="bi bi-file-earmark-text me-2 mt-1"></i>
            <span>Advanced Python Programming</span>
          </a>
        </li>
      </ul>
    </div>
    <hr>

    <!-- Notifications -->
    <div class="mb-4">
      <h3 class="h5"><i class="bi bi-bell me-2"></i>Notifikasi</h3>
      <ul class="list-unstyled">
        <li>
          <a href="#" class="text-decoration-none d-flex align-items-center">
            <i class="bi bi-bell-fill me-2"></i>
            <span>Anda memiliki 2 notifikasi baru</span>
          </a>
        </li>
      </ul>
    </div>
    <hr>

    <!-- Recent Activity -->
    <div class="mb-4">
      <h3 class="h5"><i class="bi bi-clock-history me-2"></i>Aktivitas Terbaru</h3>
      <ul class="list-unstyled">
        <li class="mb-2">
          <i class="bi bi-check-circle-fill text-success me-2"></i>
          <span>Anda baru saja menyelesaikan Kuis Desain Grafis</span>
        </li>
        <li class="mb-2">
          <i class="bi bi-folder-fill text-primary me-2"></i>
          <span>Anda membuka materi "Manajemen Proyek"</span>
        </li>
      </ul>
    </div>
    <hr>

    <!-- Announcements -->
    <div class="mb-4">
      <h3 class="h5"><i class="bi bi-megaphone me-2"></i>Pengumuman</h3>
      <div class="d-flex">
        <i class="bi bi-info-circle-fill text-primary me-2 mt-1"></i>
        <p>Ujian akhir akan dilaksanakan pada 30 November 2023.</p>
      </div>
    </div>
    <hr>

    <!-- Quick Links -->
    <div class="mb-4">
      <h3 class="h5"><i class="bi bi-link me-2"></i>Tautan Cepat</h3>
      <ul class="list-unstyled">
        <li class="mb-2">
          <a href="#" class="text-decoration-none d-flex align-items-center">
            <i class="bi bi-file-earmark-text me-2"></i>
            <span>Materi Terbaru</span>
          </a>
        </li>
        <li class="mb-2">
          <a href="#" class="text-decoration-none d-flex align-items-center">
            <i class="bi bi-question-circle me-2"></i>
            <span>Kuis Mendatang</span>
          </a>
        </li>
        <li class="mb-2">
          <a href="#" class="text-decoration-none d-flex align-items-center">
            <i class="bi bi-chat-dots me-2"></i>
            <span>Forum Diskusi</span>
          </a>
        </li>
      </ul>
    </div>
  </div>
</div>

<!-- Main Content -->
 <section id = "Daftar Materi"> 
<main class="main-content">
  <div class="container-fluid">
    <div class="row">
      <section class="col-md-12 p-4">
        <!-- Materials Section -->
        <div class="section-container">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="section-title"><i class="bi bi-journal-text me-2"></i>Daftar Materi</h2>
            <button class="btn btn-custom" data-bs-toggle="modal" data-bs-target="#tambahMateriModal">
              <i class="bi bi-plus-circle me-1"></i>Tambah Materi
            </button>
          </div>

          <?php
include 'koneksi.php'; // koneksi ke database

$sql = "SELECT * FROM materi ORDER BY id DESC";
$result = mysqli_query($conn, $sql);
?>

<div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
<?php while ($row = mysqli_fetch_assoc($result)) : ?>
  <div class="col">
    <div class="card h-100">
      <img src="images/<?= htmlspecialchars($row['gambar']) ?>" class="card-img-top" alt="Gambar Materi">
      <div class="card-body">
        <h5 class="card-title"><?= htmlspecialchars($row['judul']) ?></h5>
        <p class="card-text"><?= nl2br(htmlspecialchars($row['deskripsi'])) ?></p>
        <div class="d-flex justify-content-between align-items-center">
          <span class="badge bg-primary">Materi</span>
          <div class="d-flex gap-2">
            <a href="detail_materi.php?id=<?= $row['id'] ?>" class="btn btn-primary btn-sm">Buka Materi</a>
            <a href="edit.php?id=<?= $row['id'] ?>" class="btn btn-warning btn-sm">Edit</a>
          </div>
        </div>
      </div>
    </div>
  </div>
<?php endwhile; ?>
</div>


          
          <br>

       <!-- Quizzes Section -->
       <section id = "Daftar Kuis"> 
<div class="section-container">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2 class="section-title"><i class="bi bi-question-circle me-2"></i>Daftar Kuis</h2>
    <button class="btn btn-custom" data-bs-toggle="modal" data-bs-target="#tambahKuisModal">
  <i class="bi bi-plus-circle me-1"></i>Tambah Kuis
</button>

  </div>
  <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4" id="daftar-kuis">
</div>

  <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
    <!-- Quiz Card 1 -->
    <div class="col">
      <div class="card h-100">
        <img src="images/quiz1.jpeg" class="card-img-top" alt="Ilustrasi Kuis Pemrograman">
        <div class="card-body">
          <h5 class="card-title">Kuis Pemrograman Dasar</h5>
          <p class="card-text">Uji pemahaman Anda tentang dasar-dasar pemrograman dengan 20 pertanyaan pilihan ganda.</p>
          <div class="d-flex justify-content-between align-items-center">
            <span class="badge bg-warning text-dark">Belum Selesai</span>
            <a href="detail_kuis1.php" class="btn btn-custom btn-sm">Mulai Kuis</a>
          </div>
        </div>
      </div>
    </div>

            
            <!-- Quiz Card 2 -->
            <div class="col">
              <div class="card h-100">
                <img src="images/quiz2.jpeg" class="card-img-top" alt="Ilustrasi Kuis Desain">
                <div class="card-body">
                  <h5 class="card-title">Kuis Desain Grafis</h5>
                  <p class="card-text">Uji kemampuan dan pemahaman desain grafis Anda dengan studi kasus praktis.</p>
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="badge bg-success">Selesai</span>
                    <a href="detail_kuis2.php" class="btn btn-custom btn-sm">Mulai Kuis</a>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Quiz Card 3 -->
            <div class="col">
              <div class="card h-100">
                <img src="images/quiz3.jpeg" class="card-img-top" alt="Ilustrasi Kuis Manajemen">
                <div class="card-body">
                  <h5 class="card-title">Kuis Manajemen Proyek</h5>
                  <p class="card-text">Uji pengetahuan Anda tentang metodologi dan praktik terbaik Manajemen Proyek.</p>
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="badge bg-success">Selesai</span>
                    <a href="detail_kuis3.php" class="btn btn-custom btn-sm">Mulai Kuis</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Discussion Forum Section -->
        <section id = "Daftar Diskusi"> 
        <div class="section-container">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="section-title"><i class="bi bi-chat-dots me-2"></i>Forum Diskusi</h2>
            <button class="btn btn-custom" data-bs-toggle="modal" data-bs-target="#newDiscussionModal">
              <i class="bi bi-plus-circle me-1"></i>Mulai Diskusi Baru
            </button>
          </div>
          
          <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            <!-- Discussion Card 1 -->
            <div class="col">
  <a href="detail_diskusi1.php" class="text-decoration-none text-dark">
    <div class="card h-100 shadow-sm hover:shadow-lg transition">
      <img src="images/forum1.jpeg" class="card-img-top" alt="Diskusi tentang Pemrograman">
      <div class="card-body">
        <h5 class="card-title">Bagaimana cara memulai proyek pertama?</h5>
        <p class="card-text">Saya baru belajar pemrograman dan ingin tahu langkah-langkah memulai proyek pertama saya dengan baik.</p>
        <div class="d-flex justify-content-between align-items-center">
          <small class="text-muted">Oleh: User1</small>
          <span class="badge bg-light text-dark">
            <i class="bi bi-chat-left-text me-1"></i>12
          </span>
        </div>
      </div>
    </div>
  </a>
</div>

            
           <!-- Discussion Card 2 (klik untuk masuk halaman detail) -->
<div class="col">
  <a href="detail_diskusi2.php" class="text-decoration-none text-dark">
    <div class="card h-100">
      <img src="images/forum2.jpeg" class="card-img-top" alt="Diskusi tentang Desain">
      <div class="card-body">
        <h5 class="card-title">Tips untuk desain yang menarik</h5>
        <p class="card-text">Apa saja tips dan trik untuk membuat desain yang menarik dan profesional untuk pemula?</p>
        <div class="d-flex justify-content-between align-items-center">
          <small class="text-muted">Oleh: User2</small>
          <span class="badge bg-light text-dark"><i class="bi bi-chat-left-text me-1"></i>8</span>
        </div>
      </div>
    </div>
  </a>
</div>

            
            <!-- Discussion Card 3 -->
            <div class="col">
            <a href="detail_diskusi3.php" class="text-decoration-none text-dark">
              <div class="card h-100">
                <img src="images/forum3.jpeg" class="card-img-top" alt="Diskusi tentang Manajemen">
                <div class="card-body">
                  <h5 class="card-title">Belajar Manajemen Proyek untuk Pemula</h5>
                  <p class="card-text">Bagaimana cara menjadi manajer proyek yang handal dan profesional? Apa langkah pertama yang harus dipelajari?</p>
                  <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">Oleh: User3</small>
                    <span class="badge bg-light text-dark"><i class="bi bi-chat-left-text me-1"></i>5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </a>
        </div>

        <!-- Users Table -->
        <div class="section-container">
          <h2 class="section-title"><i class="bi bi-people me-2"></i>Daftar Pengguna</h2>
          <div class="table-responsive">
            <table id="usersTable" class="table table-hover" style="width:100%">
              <thead class="table-light">
                <tr>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>User1</td>
                  <td>user1@example.com</td>
                  <td><span class="badge bg-primary">Student</span></td>
                  <td><span class="badge bg-success">Active</span></td>
                  <td>
                    <button class="btn btn-sm btn-outline-primary"><i class="bi bi-eye"></i></button>
                    <button class="btn btn-sm btn-outline-secondary"><i class="bi bi-pencil"></i></button>
                  </td>
                </tr>
                <tr>
                  <td>User2</td>
                  <td>user2@example.com</td>
                  <td><span class="badge bg-warning text-dark">Teacher</span></td>
                  <td><span class="badge bg-success">Active</span></td>
                  <td>
                    <button class="btn btn-sm btn-outline-primary"><i class="bi bi-eye"></i></button>
                    <button class="btn btn-sm btn-outline-secondary"><i class="bi bi-pencil"></i></button>
                  </td>
                </tr>
                <tr>
                  <td>User3</td>
                  <td>user3@example.com</td>
                  <td><span class="badge bg-primary">Student</span></td>
                  <td><span class="badge bg-secondary">Inactive</span></td>
                  <td>
                    <button class="btn btn-sm btn-outline-primary"><i class="bi bi-eye"></i></button>
                    <button class="btn btn-sm btn-outline-secondary"><i class="bi bi-pencil"></i></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  </div>
</main>

<!-- New Discussion Modal -->
<div class="modal fade" id="newDiscussionModal" tabindex="-1" aria-labelledby="newDiscussionModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="newDiscussionModalLabel"><i class="bi bi-plus-circle me-2"></i>Mulai Diskusi Baru</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <form>
          <div class="mb-3">
            <label for="discussionTitle" class="form-label">Judul Diskusi</label>
            <input type="text" class="form-control" id="discussionTitle" placeholder="Masukkan judul yang jelas dan deskriptif" required>
          </div>
          
          <div class="mb-3">
            <label for="discussionContent" class="form-label">Isi Diskusi</label>
            <textarea class="form-control" id="discussionContent" rows="5" placeholder="Jelaskan pertanyaan atau topik Anda secara detail..." required></textarea>
          </div>
          <div class="mb-3">
            <label for="discussionTags" class="form-label">Tag (pisahkan dengan koma)</label>
            <input type="text" class="form-control" id="discussionTags" placeholder="contoh: python, pemula, proyek">
          </div>
          <div class="d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Batal</button>
            <button type="submit" class="btn btn-custom">Posting Diskusi</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>


<!-- Modal Tambah Materi -->
<div class="modal fade" id="tambahMateriModal" tabindex="-1" aria-labelledby="tambahMateriModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
    
      <div class="modal-header">
        <h5 class="modal-title" id="tambahMateriModalLabel"><i class="bi bi-file-earmark-plus me-2"></i>Tambah Materi</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
      </div>
      
      <div class="modal-body">
        <form action="proses_tambah_materi.php" method="POST" enctype="multipart/form-data">
          
          <!-- Judul Materi -->
          <div class="mb-3">
            <label for="judul" class="form-label">Judul Materi</label>
            <input type="text" name="judul" id="judul" class="form-control" placeholder="Masukkan judul materi" required>
          </div>
          
          <!-- Deskripsi -->
          <div class="mb-3">
            <label for="deskripsi" class="form-label">Deskripsi Singkat</label>
            <textarea name="deskripsi" id="deskripsi" class="form-control" rows="3" placeholder="Tuliskan deskripsi materi" required></textarea>
          </div>
          
          <!-- Isi Materi -->
          <div class="mb-3">
            <label for="isi_materi" class="form-label">Isi Materi (bisa teks, HTML, embed video)</label>
            <textarea name="isi_materi" id="isi_materi" class="form-control" rows="6" placeholder="Masukkan konten materi" required></textarea>
          </div>
          
          <!-- Upload Gambar -->
          <div class="mb-3">
            <label for="gambar" class="form-label">Unggah Gambar (opsional)</label>
            <input type="file" name="gambar" id="gambar" class="form-control" accept="image/*">
          </div>
          
          <!-- Tombol -->
          <div class="d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Batal</button>
            <button type="submit" class="btn btn-custom">Simpan Materi</button>
          </div>
        </form>
      </div>
      
    </div>
  </div>
</div>


<!-- Modal Tambah Kuis -->
<div class="modal fade" id="tambahKuisModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header bg-primary text-white">
        <h5 class="modal-title">Tambah Kuis + Soal Sekaligus</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <!-- Form Utama -->
        <div class="mb-4">
          <h6 class="fw-bold border-bottom pb-2">Informasi Kuis</h6>
          <div class="mb-3">
            <label class="form-label">Judul Kuis <span class="text-danger">*</span></label>
            <input type="text" id="judulKuis" class="form-control" placeholder="Contoh: Kuis PHP Dasar" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Deskripsi</label>
            <textarea id="deskripsiKuis" class="form-control" rows="2"></textarea>
          </div>
          <div class="mb-3">
            <label class="form-label">Gambar Thumbnail Kuis</label>
            <div class="d-flex align-items-center">
              <div class="me-3">
                <img id="previewImage" src="https://via.placeholder.com/150" alt="Preview" class="img-thumbnail" style="width: 150px; height: 150px; object-fit: cover;">
              </div>
              <div class="flex-grow-1">
                <input type="file" id="gambarKuis" class="form-control" accept="image/*">
                <small class="text-muted">Format: JPG, PNG (Maks. 2MB)</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Soal -->
        <h6 class="fw-bold border-bottom pb-2">Daftar Soal</h6>
        <div id="soalContainer">
          <!-- Soal 1 -->
          <div class="soal-item card mb-3">
            <div class="card-header bg-light d-flex justify-content-between">
              <span class="fw-bold">Soal #1</span>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label">Pertanyaan <span class="text-danger">*</span></label>
                <input type="text" class="form-control pertanyaan" placeholder="Tulis pertanyaan..." required>
              </div>
              <div class="row g-2">
                <div class="col-md-6">
                  <label class="form-label">Opsi A <span class="text-danger">*</span></label>
                  <input type="text" class="form-control opsi" data-opsi="a" placeholder="Jawaban A" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Opsi B <span class="text-danger">*</span></label>
                  <input type="text" class="form-control opsi" data-opsi="b" placeholder="Jawaban B" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Opsi C <span class="text-danger">*</span></label>
                  <input type="text" class="form-control opsi" data-opsi="c" placeholder="Jawaban C" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Opsi D <span class="text-danger">*</span></label>
                  <input type="text" class="form-control opsi" data-opsi="d" placeholder="Jawaban D" required>
                </div>
              </div>
              <div class="mt-3">
                <label class="form-label">Jawaban Benar <span class="text-danger">*</span></label>
                <select class="form-select jawaban-benar" required>
                  <option value="">Pilih Jawaban</option>
                  <option value="a">A</option>
                  <option value="b">B</option>
                  <option value="c">C</option>
                  <option value="d">D</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Tombol Tambah Soal -->
        <button type="button" id="tambahSoalBtn" class="btn btn-sm btn-success mb-3">
          <i class="bi bi-plus-circle"></i> Tambah Soal
        </button>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
        <button type="button" id="simpanKuisBtn" class="btn btn-primary">
          <i class="bi bi-save"></i> Simpan Semua
        </button>
      </div>
    </div>
  </div>
</div>

<!-- Template Pertanyaan (Hidden) -->
<script type="text/template" id="templatePertanyaan">
  <div class="pertanyaan-item card mb-3" data-id="<%= id %>">
    <div class="card-header bg-light d-flex justify-content-between align-items-center">
      <span class="fw-bold">Pertanyaan #<%= nomor %></span>
      <button type="button" class="btn btn-sm btn-danger hapus-pertanyaan">
        <i class="bi bi-trash"></i> Hapus
      </button>
    </div>
    <div class="card-body">
      <div class="mb-3">
        <label class="form-label">Pertanyaan <span class="text-danger">*</span></label>
        <input type="text" class="form-control pertanyaan-text" placeholder="Masukkan pertanyaan" required>
      </div>
      
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Opsi A <span class="text-danger">*</span></label>
          <div class="input-group">
            <span class="input-group-text">A</span>
            <input type="text" class="form-control opsi-a" placeholder="Jawaban A" required>
          </div>
        </div>
        <div class="col-md-6">
          <label class="form-label">Opsi B <span class="text-danger">*</span></label>
          <div class="input-group">
            <span class="input-group-text">B</span>
            <input type="text" class="form-control opsi-b" placeholder="Jawaban B" required>
          </div>
        </div>
        <div class="col-md-6">
          <label class="form-label">Opsi C <span class="text-danger">*</span></label>
          <div class="input-group">
            <span class="input-group-text">C</span>
            <input type="text" class="form-control opsi-c" placeholder="Jawaban C" required>
          </div>
        </div>
        <div class="col-md-6">
          <label class="form-label">Opsi D <span class="text-danger">*</span></label>
          <div class="input-group">
            <span class="input-group-text">D</span>
            <input type="text" class="form-control opsi-d" placeholder="Jawaban D" required>
          </div>
        </div>
      </div>
      
      <div class="mt-3">
        <label class="form-label">Jawaban Benar <span class="text-danger">*</span></label>
        <select class="form-select jawaban-benar" required>
          <option value="">Pilih jawaban benar</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </select>
      </div>
    </div>
  </div>
</script>


<!-- Footer -->
<footer class="container-sections">
  <div class="footer-sections">
    <div class="footer-section">
      <h4>Tentang Learnfy</h4>
      <a href="#">Visi & Misi</a>
      <a href="#">Tim Pengajar</a>
      <a href="#">Metodologi</a>
      <a href="#">Testimoni</a>
      <a href="#">Karir</a>
    </div>
    <div class="footer-section">
      <h4>Kategori Belajar</h4>
      <a href="#">Pemrograman</a>
      <a href="#">Desain Grafis</a>
      <a href="#">Bisnis</a>
      <a href="#">Bahasa</a>
      <a href="#">Pengembangan Diri</a>
    </div>
    <div class="footer-section">
      <h4>Dukungan</h4>
      <a href="#">Pusat Bantuan</a>
      <a href="#">Kebijakan Privasi</a>
      <a href="#">Syarat & Ketentuan</a>
      <a href="#">FAQ</a>
      <a href="#">Hubungi Kami</a>
    </div>
    <div class="footer-section">
      <h4>Sumber Daya</h4>
      <a href="#">Blog</a>
      <a href="#">Panduan Belajar</a>
      <a href="#">Template Gratis</a>
      <a href="#">Glosarium</a>
      <a href="#">Event</a>
    </div>
  </div>

  <div class="footer-subscribe text-center">
    <h4>Berlangganan Newsletter</h4>
    <p>Dapatkan update materi baru, tips belajar, dan penawaran khusus langsung ke inbox Anda.</p>
    <form class="subscribe-form">
      <input type="email" class="form-control" placeholder="Alamat email Anda" required>
      <button type="submit" class="btn btn-custom">Berlangganan</button>
    </form>
  </div>

  <div class="footer-social text-center">
    <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
    <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
    <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
    <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
    <a href="#" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
  </div>

  <div class="footer-copyright text-center">
    <p>© 2025 Learnfy. Seluruh hak cipta dilindungi undang-undang.</p>
  </div>
</footer>


<!-- JavaScript untuk Menangani Pertanyaan -->
<script>
document.addEventListener('DOMContentLoaded', function() {
  // Tambah Soal Baru
  document.getElementById('tambahSoalBtn').addEventListener('click', function() {
    const soalContainer = document.getElementById('soalContainer');
    const soalCount = soalContainer.children.length + 1;
    
    const newSoal = `
      <div class="soal-item card mb-3">
        <div class="card-header bg-light d-flex justify-content-between">
          <span class="fw-bold">Soal #${soalCount}</span>
          <button type="button" class="btn btn-sm btn-danger hapus-soal">
            <i class="bi bi-trash"></i>
          </button>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <label class="form-label">Pertanyaan <span class="text-danger">*</span></label>
            <input type="text" class="form-control pertanyaan" required>
          </div>
          <div class="row g-2">
            <div class="col-md-6">
              <label class="form-label">Opsi A <span class="text-danger">*</span></label>
              <input type="text" class="form-control opsi" data-opsi="a" required>
            </div>
            <div class="col-md-6">
              <label class="form-label">Opsi B <span class="text-danger">*</span></label>
              <input type="text" class="form-control opsi" data-opsi="b" required>
            </div>
            <div class="col-md-6">
              <label class="form-label">Opsi C <span class="text-danger">*</span></label>
              <input type="text" class="form-control opsi" data-opsi="c" required>
            </div>
            <div class="col-md-6">
              <label class="form-label">Opsi D <span class="text-danger">*</span></label>
              <input type="text" class="form-control opsi" data-opsi="d" required>
            </div>
          </div>
          <div class="mt-3">
            <label class="form-label">Jawaban Benar <span class="text-danger">*</span></label>
            <select class="form-select jawaban-benar" required>
              <option value="">Pilih Jawaban</option>
              <option value="a">A</option>
              <option value="b">B</option>
              <option value="c">C</option>
              <option value="d">D</option>
            </select>
          </div>
        </div>
      </div>
    `;
    
    soalContainer.insertAdjacentHTML('beforeend', newSoal);
  });

  // Hapus Soal
  document.getElementById('soalContainer').addEventListener('click', function(e) {
    if (e.target.closest('.hapus-soal')) {
      e.target.closest('.soal-item').remove();
      updateNomorSoal();
    }
  });

  // Update Nomor Soal
  function updateNomorSoal() {
    const soalItems = document.querySelectorAll('.soal-item');
    soalItems.forEach((item, index) => {
      item.querySelector('.card-header span').textContent = `Soal #${index + 1}`;
    });
  }

  // Simpan Kuis
  document.getElementById('simpanKuisBtn').addEventListener('click', function() {
    const judul = document.getElementById('judulKuis').value;
    const deskripsi = document.getElementById('deskripsiKuis').value;
    const soalItems = document.querySelectorAll('.soal-item');

    // Validasi
    if (!judul) {
      alert('Judul kuis harus diisi!');
      return;
    }

    if (soalItems.length === 0) {
      alert('Tambahkan minimal 1 soal!');
      return;
    }

    // Kumpulkan Data
    const kuisData = {
      judul: judul,
      deskripsi: deskripsi,
      soal: []
    };

    let isValid = true;
    soalItems.forEach((item, index) => {
      const pertanyaan = item.querySelector('.pertanyaan').value;
      const opsiA = item.querySelector('.opsi[data-opsi="a"]').value;
      const opsiB = item.querySelector('.opsi[data-opsi="b"]').value;
      const opsiC = item.querySelector('.opsi[data-opsi="c"]').value;
      const opsiD = item.querySelector('.opsi[data-opsi="d"]').value;
      const jawabanBenar = item.querySelector('.jawaban-benar').value;

      if (!pertanyaan || !opsiA || !opsiB || !opsiC || !opsiD || !jawabanBenar) {
        isValid = false;
        alert(`Soal #${index + 1} belum lengkap!`);
        return;
      }

      kuisData.soal.push({
        pertanyaan: pertanyaan,
        opsi_a: opsiA,
        opsi_b: opsiB,
        opsi_c: opsiC,
        opsi_d: opsiD,
        jawaban_benar: jawabanBenar
      });
    });

    if (!isValid) return;

    // Kirim ke Server (AJAX)
    fetch('simpan_kuis.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(kuisData)
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Kuis berhasil disimpan!');
        $('#tambahKuisModal').modal('hide');
        location.reload(); // Refresh halaman
      } else {
        alert('Gagal menyimpan: ' + (data.error || 'Unknown error'));
      }
    })
    .catch(error => {
      alert('Error: ' + error.message);
    });
  });
});
</script>

<script>
document.addEventListener('DOMContentLoaded', function() {
  // Preview gambar yang dipilih
  document.getElementById('gambarKuis').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        document.getElementById('previewImage').src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // Kode lainnya (tambah soal, hapus soal, dll.)
  // ... [kode JavaScript sebelumnya yang sudah ada] ...
  
  // Update fungsi simpan untuk handle gambar
  document.getElementById('simpanKuisBtn').addEventListener('click', function() {
    const formData = new FormData();
    const imageFile = document.getElementById('gambarKuis').files[0];
    
    if (imageFile) {
      formData.append('gambar', imageFile);
    }
    
    // Tambahkan data lainnya ke formData
    formData.append('judul', document.getElementById('judulKuis').value);
    formData.append('deskripsi', document.getElementById('deskripsiKuis').value);
    
    // Kirim ke server
    fetch('simpan_kuis.php', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Kuis berhasil disimpan!');
        $('#tambahKuisModal').modal('hide');
        location.reload();
      }
    });
  });
});
</script>

  <!-- Chart.js -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <!-- Bootstrap 5 JS -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  <!-- DataTables JS -->
  <script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>
  <script src="https://cdn.datatables.net/1.13.6/js/dataTables.bootstrap5.min.js"></script>
  <script>
    // Inisialisasi Chart.js
    document.addEventListener('DOMContentLoaded', function() {
      const ctx = document.getElementById('quizChart').getContext('2d');
      const quizChart = new Chart(ctx, {
        type: 'bar', // Jenis chart (bisa diganti ke 'line', 'pie', dll.)
        data: {
          labels: ['Quiz 1', 'Quiz 2', 'Quiz 3', 'Quiz 4', 'Quiz 5'], // Label quiz
          datasets: [{
            label: 'Nilai Rata-rata',
            data: [85, 90, 78, 92, 88], // Data nilai rata-rata
            backgroundColor: 'rgba(143, 144, 255, 0.5)', // Warna background
            borderColor: '#8F90FF', // Warna border
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              max: 100
            }
          }
        }
      });

      // Inisialisasi DataTables
      $('#usersTable').DataTable();
    });
  </script>
</body>