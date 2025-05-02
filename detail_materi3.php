<?php
// Data materi manajemen proyek
$materi = [
    [
        'icon' => 'fa-project-diagram',
        'nomor' => '01',
        'judul' => 'Dasar Manajemen Proyek',
        'deskripsi' => 'Memahami konsep dasar, prinsip, dan metodologi dalam manajemen proyek modern.'
    ],
    [
        'icon' => 'fa-tasks',
        'nomor' => '02',
        'judul' => 'Perencanaan Proyek',
        'deskripsi' => 'Teknik menyusun rencana proyek yang efektif termasuk scope, timeline, dan alokasi sumber daya.'
    ],
    [
        'icon' => 'fa-users',
        'nomor' => '03',
        'judul' => 'Manajemen Tim',
        'deskripsi' => 'Strategi membangun dan memimpin tim proyek yang produktif dan kolaboratif.'
    ],
    [
        'icon' => 'fa-chart-line',
        'nomor' => '04',
        'judul' => 'Monitoring & Evaluasi',
        'deskripsi' => 'Teknik memantau progres proyek dan mengevaluasi kinerja terhadap target yang ditetapkan.'
    ],
    [
        'icon' => 'fa-exclamation-triangle',
        'nomor' => '05',
        'judul' => 'Manajemen Risiko',
        'deskripsi' => 'Identifikasi, analisis, dan mitigasi risiko potensial dalam pelaksanaan proyek.'
    ],
    [
        'icon' => 'fa-file-alt',
        'nomor' => '06',
        'judul' => 'Pelaporan Proyek',
        'deskripsi' => 'Penyusunan laporan proyek yang efektif untuk berbagai stakeholder.'
    ]
];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Materi Manajemen Proyek</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --primary-color: #8F90FF;
            --secondary-color: #6c757d;
            --accent-color: #E0E1FF;
            --dark-color: #292F36;
            --light-color: #F8F9FA;
            --card-bg: #FFFFFF;
            --transition-speed: 0.3s;
            --header-gradient: linear-gradient(135deg, #8F90FF 0%, #6A6BFF 100%);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.7;
            color: var(--dark-color);
            background-color: #F5F5F5;
            -webkit-font-smoothing: antialiased;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }

        /* Header Styles */
        .header {
            background: var(--header-gradient);
            color: var(--light-color);
            padding: 3rem 0 6rem;
            position: relative;
            overflow: hidden;
            clip-path: polygon(0 0, 100% 0, 100% 90%, 0 100%);
            margin-bottom: 1rem;
        }

        .header-content {
            position: relative;
            z-index: 2;
            text-align: center;
        }

        .header h1 {
            font-size: 3rem;
            font-weight: 700;
            margin-bottom: 1rem;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .header p {
            font-size: 1.2rem;
            opacity: 0.9;
            max-width: 700px;
            margin: 0 auto;
        }

        /* Navigation */
        .nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem 0;
            margin-bottom: 1rem;
        }

        .back-button {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background-color: var(--primary-color);
            color: white;
            border-radius: 50px;
            text-decoration: none;
            font-weight: 500;
            transition: all var(--transition-speed) ease;
            border: 2px solid transparent;
        }

        .back-button:hover {
            background-color: transparent;
            color: var(--primary-color);
            border-color: var(--primary-color);
            transform: translateX(-5px);
        }


        /* Materi Grid */
        .materi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 2rem;
            margin: 4rem 0;
        }

        .materi-card {
            background: var(--card-bg);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            transition: all var(--transition-speed) ease;
            position: relative;
            border: none;
        }

        .materi-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 15px 35px rgba(143,144,255,0.2);
        }

        .card-number {
            position: absolute;
            top: 1.5rem;
            right: 1.5rem;
            font-size: 3.5rem;
            font-weight: 800;
            color: rgba(143,144,255,0.08);
            line-height: 1;
            z-index: 1;
        }

        .card-content {
            padding: 2.5rem;
            position: relative;
            z-index: 2;
        }

        .card-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 60px;
            height: 60px;
            background-color: var(--primary-color);
            color: white;
            border-radius: 16px;
            font-size: 1.75rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 4px 12px rgba(143,144,255,0.3);
            transition: all var(--transition-speed) ease;
        }

        .card-title {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--dark-color);
            line-height: 1.3;
        }

        .card-desc {
            color: var(--secondary-color);
            font-size: 1rem;
            line-height: 1.6;
        }

        /* Footer */
        .footer {
            background-color: var(--dark-color);
            color: var(--light-color);
            text-align: center;
            padding: 3rem 0;
            margin-top: 4rem;
        }

        .footer p {
            opacity: 0.8;
            font-size: 0.95rem;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .header {
                padding: 3rem 0 5rem;
                clip-path: polygon(0 0, 100% 0, 100% 95%, 0 100%);
            }
            
            .header h1 {
                font-size: 2.2rem;
            }
            
            .materi-grid {
                grid-template-columns: 1fr;
                gap: 1.5rem;
            }
            
            .card-content {
                padding: 2rem;
            }
        }

        /* Animations */
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }

        .materi-card:hover .card-icon {
            animation: pulse 1.5s ease infinite;
            background: var(--header-gradient);
        }

        /* Accessibility */
        a:focus, button:focus {
            outline: 3px solid var(--accent-color);
            outline-offset: 3px;
        }
    </style>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <header class="header">
        <div class="container header-content">
            <h1>Manajemen Proyek</h1>
            <p>Pelajari metodologi dan praktik terbaik untuk mengelola proyek secara efektif dan efisien</p>
        </div>
    </header>

    <main class="container">
        <nav class="nav">
            <a href="info.php" class="back-button">
                <i class="fas fa-arrow-left"></i>
                Kembali ke Beranda
            </a>
        </nav>

        <div class="materi-grid">
            <?php foreach ($materi as $item): ?>
                <article class="materi-card">
                    <div class="card-number"><?php echo $item['nomor']; ?></div>
                    <div class="card-content">
                        <div class="card-icon">
                            <i class="fas <?php echo $item['icon']; ?>"></i>
                        </div>
                        <h3 class="card-title"><?php echo $item['judul']; ?></h3>
                        <p class="card-desc"><?php echo $item['deskripsi']; ?></p>
                    </div>
                </article>
            <?php endforeach; ?>
        </div>
    </main>

    <footer class="footer">
        <div class="container">
            <p>© <?php echo date('Y'); ?> E-Learning Manajemen Proyek. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>