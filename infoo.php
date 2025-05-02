<?php?>
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
<body><link rel="stylesheet" href="infoo.css">

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
          </div>
          
          <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            <!-- Material Card 1 -->
            <div class="col">
              <div class="card h-100">
                <img src="images/program.jpeg" class="card-img-top" alt="Ilustrasi Pemrograman Dasar">
                <div class="card-body">
                  <h5 class="card-title">Pemrograman Dasar</h5>
                  <p class="card-text">Pelajari dasar-dasar pemrograman menggunakan Python dengan pendekatan praktis dan contoh nyata.</p>
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="badge bg-primary">Baru</span>
                    <a href="detail_materi1.php" class="btn btn-custom btn-sm">Buka Materi</a>
                  </div>
                </div>
              </div>
            </div>

            
            <!-- Material Card 2 -->
            <div class="col">
              <div class="card h-100">
                <img src="images/web.jpeg" class="card-img-top" alt="Ilustrasi Desain Grafis">
                <div class="card-body">
                  <h5 class="card-title">Desain Grafis</h5>
                  <p class="card-text">Kuasai tools desain seperti Adobe Photoshop dan Illustrator melalui proyek-proyek kreatif.</p>
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="badge bg-success">Populer</span>
                    <a href="detail_materi2.php" class="btn btn-custom btn-sm">Buka Materi</a>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Material Card 3 -->
            <div class="col">
              <div class="card h-100">
                <img src="images/project.jpeg" class="card-img-top" alt="Ilustrasi Manajemen Proyek">
                <div class="card-body">
                  <h5 class="card-title">Manajemen Proyek</h5>
                  <p class="card-text">Pelajari dasar-dasar Manajemen Proyek tingkat pemula dengan studi kasus dunia nyata.</p>
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="badge bg-info">Rekomendasi</span>
                    <a href="detail_materi3.php" class="btn btn-custom btn-sm">Buka Materi</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

       <!-- Quizzes Section -->
       <section id = "Daftar Kuis"> 
<div class="section-container">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2 class="section-title"><i class="bi bi-question-circle me-2"></i>Daftar Kuis</h2>
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