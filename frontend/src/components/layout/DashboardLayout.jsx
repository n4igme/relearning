import { Outlet, Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define navigation based on user role
  const getNavigation = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin', icon: '📊' },
          { name: 'Pending Approvals', path: '/admin/approvals', icon: '⏳' },
          { name: 'User Management', path: '/admin/users', icon: '👥' },
          { name: 'All Courses', path: '/admin/courses', icon: '📚' },
        ];
      case 'mentor':
        return [
          { name: 'Dashboard', path: '/mentor', icon: '📊' },
          { name: 'My Content', path: '/mentor/content', icon: '📝' },
          { name: 'Create Course', path: '/mentor/create-course', icon: '➕' },
          { name: 'Create Quest', path: '/mentor/create-quest', icon: '🎯' },
        ];
      case 'student':
        return [
          { name: 'Dashboard', path: '/student', icon: '📊' },
          { name: 'My Courses', path: '/student/courses', icon: '📚' },
          { name: 'Certificates', path: '/student/certificates', icon: '🏆' },
          { name: 'Browse Courses', path: '/courses', icon: '🔍' },
        ];
      default:
        return [];
    }
  };

  const navigation = getNavigation();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Bar */}
      <div className="bg-white shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">e</span>
              </div>
              <span className="text-xl font-bold text-gray-900">eLearning</span>
            </Link>

            <div className="flex items-center space-x-4">
              <Link to="/forum" className="text-gray-700 hover:text-primary-600 transition-colors">
                Forum
              </Link>
              <Link to="/profile" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
                <span>{user?.name}</span>
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
