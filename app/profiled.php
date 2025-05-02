<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Profile</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        :root {
            --primary-color: #8F90FF;
            --primary-hover: #7A7BFF;
            --secondary-color: #6c757d;
            --light-bg: #F5F5FF;
            --card-bg: #FFFFFF;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            background-color: #f8f9fa;
        }
        
        .sidebar {
            width: 80px;
            background-color: white;
            height: 100vh;
            padding-top: 20px;
            box-shadow: 2px 0 10px rgba(0,0,0,0.1);
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        .navbar-brand {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 30px;
            width: 100%;
            padding: 0 10px;
            box-sizing: border-box;
            text-decoration: none;
        }
        
        .navbar-brand img {
            width: 40px;
            height: 40px;
            object-fit: contain;
        }
        
        .sidebar-menu {
            list-style: none;
            padding: 0;
            margin: 0;
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        .sidebar-menu li {
            width: 100%;
            display: flex;
            justify-content: center;
            padding: 15px 0;
            transition: all 0.3s;
            cursor: pointer;
        }
        
        .sidebar-menu li:hover {
            background-color: var(--light-bg);
        }
        
        .sidebar-menu li.active {
            background-color: var(--primary-color);
        }
        
        .sidebar-menu li.active i {
            color: white;
        }
        
        .sidebar-menu li i {
            font-size: 20px;
            color: var(--secondary-color);
        }
        
        .main-content {
            flex: 1;
            padding: 30px;
            padding-top: 20px;
        }
        
        .profile-header {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 30px;
        }
        
        .user-dropdown {
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
        }
        
        .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
        }
        
        .profile-container {
            display: flex;
            align-items: flex-start;
            gap: 30px;
            margin-top: 20px;
        }
        
        .profile-photo {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            background-color: #e9ecef;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        
        .profile-photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .profile-card {
            background-color: var(--card-bg);
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            flex: 1;
        }
        
        .profile-title {
            font-size: 24px;
            margin-bottom: 30px;
            color: #333;
            font-weight: 600;
        }
        
        .profile-info {
            display: grid;
            grid-template-columns: 150px 1fr;
            gap: 15px;
            align-items: center;
        }
        
        .profile-label {
            font-weight: 500;
            color: var(--secondary-color);
        }
        
        .profile-value {
            padding: 8px 0;
            border-bottom: 1px solid #eee;
            color: #333;
        }
        
        .dropdown-menu {
            border: none;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .dropdown-item {
            padding: 8px 16px;
        }
        
        .dropdown-item:hover {
            background-color: var(--light-bg);
            color: var(--primary-color);
        }
    </style>
</head>
<body>
    <div class="sidebar">
        <a class="navbar-brand d-flex align-items-center" href="info.php">
            <img src="images/logo.png" alt="Learnfy Logo" width="55" height="55">
        </a>
        <ul class="sidebar-menu">
            <li class="active">
                <i class="bi bi-house-door"></i>
            </li>
            <li>
                <i class="bi bi-journal-text"></i>
            </li>
            <li>
                <i class="bi bi-question-circle"></i>
            </li>
            <li>
                <i class="bi bi-chat-dots"></i>
            </li>
        </ul>
    </div>
    
    <div class="main-content">
        <!-- User dropdown in top right corner -->
        <div class="profile-header">
            <div class="dropdown">
                <div class="user-dropdown" data-bs-toggle="dropdown" aria-expanded="false">
                    <span class="fw-medium">Mr Han</span>
                    <img src="images/dosen.jpeg" alt="User Avatar" class="user-avatar">
                </div>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item" href="#"><i class="bi bi-person me-2"></i>Profile</a></li>
                    <li><a class="dropdown-item" href="logout.php"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
                </ul>
            </div>
        </div>
        
        <!-- Profile section moved down slightly -->
        <div class="profile-container">
            <div class="profile-photo">
                <img src="images/dosen.jpeg" alt="Profile Photo">
            </div>
            
            <div class="profile-card">
                <h1 class="profile-title">Profile</h1>
                
                <div class="profile-info">
                    <div class="profile-label">Username:</div>
                    <div class="profile-value">Dosenku</div>
                    
                    <div class="profile-label">Email:</div>
                    <div class="profile-value">dosen@gmail.com</div>
                    
                    <div class="profile-label">Role:</div>
                    <div class="profile-value">dosen</div>
                    
                    <div class="profile-label">Status:</div>
                    <div class="profile-value">Active</div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>