import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function RoleMenu() {
  const { user } = useAuthStore();

  if (!user) return null;

  const menuItems = {
    student: [
      { name: 'Dashboard', to: '/student' },
      { name: 'My Courses', to: '/student/courses' },
      { name: 'Certificates', to: '/student/certificates' },
    ],
    mentor: [
      { name: 'Dashboard', to: '/mentor' },
      { name: 'My Courses', to: '/mentor/content' },
      { name: 'Create Course', to: '/mentor/create-course' },
      { name: 'Create Quest', to: '/mentor/create-quest' },
    ],
    admin: [
      { name: 'Dashboard', to: '/admin' },
      { name: 'User Management', to: '/admin/users' },
      { name: 'Course Approvals', to: '/admin/approvals' },
      { name: 'All Courses', to: '/admin/courses' },
    ]
  };

  const items = menuItems[user.role] || [];

  return (
    <div className="space-y-1">
      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
        >
          {item.name}
        </Link>
      ))}
    </div>
  );
}