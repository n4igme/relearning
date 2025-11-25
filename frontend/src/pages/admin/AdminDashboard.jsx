import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { adminAPI } from '../../utils/api';
import { Link } from 'react-router-dom';

// Icons
import { 
  ChartBarIcon, 
  AcademicCapIcon, 
  DocumentTextIcon, 
  CurrencyDollarIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalQuests: 0,
    totalCertificates: 0,
    pendingCourses: 0,
    pendingQuests: 0,
    pendingPrices: 0,
    usersByRole: []
  });

  const { data: dashboardStats, isLoading, isError, refetch } = useQuery(
    'adminDashboardStats',
    () => adminAPI.getStats().then(res => res.data.data),
    {
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (dashboardStats) {
      setStats(dashboardStats);
    }
  }, [dashboardStats]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <h2 className="text-xl font-semibold">Error loading dashboard</h2>
          <p>Please try again later</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Total Users',
      value: stats.totalUsers,
      icon: UserGroupIcon,
      color: 'bg-blue-500',
      path: '/admin/users'
    },
    {
      name: 'Total Courses',
      value: stats.totalCourses,
      icon: AcademicCapIcon,
      color: 'bg-green-500',
      path: '/admin/courses'
    },
    {
      name: 'Total Assessments',
      value: stats.totalQuests,
      icon: DocumentTextIcon,
      color: 'bg-purple-500',
      path: '/admin/assessments'
    },
    {
      name: 'Total Certificates',
      value: stats.totalCertificates,
      icon: AcademicCapIcon,
      color: 'bg-yellow-500',
      path: '/admin/certificates'
    },
  ];

  const pendingCards = [
    {
      name: 'Pending Courses',
      value: stats.pendingCourses || 0,
      icon: ClockIcon,
      color: 'bg-yellow-500',
      path: '/admin/approvals'
    },
    {
      name: 'Pending Assessments',
      value: stats.pendingQuests || 0,
      icon: ClockIcon,
      color: 'bg-orange-500',
      path: '/admin/approvals'
    },
    {
      name: 'Pending Price Changes',
      value: stats.pendingPrices || 0,
      icon: CurrencyDollarIcon,
      color: 'bg-indigo-500',
      path: '/admin/approvals'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="mt-1 opacity-90">Welcome to the eLearning platform administration panel</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Link key={stat.name} to={stat.path} className="block">
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 ${stat.color} rounded-md p-3`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pending Items Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pendingCards.map((pending) => (
          <Link key={pending.name} to={pending.path} className="block">
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 ${pending.color} rounded-md p-3`}>
                    <pending.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{pending.name}</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{pending.value}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Users by Role */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Users by Role</h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.usersByRole && stats.usersByRole.length > 0 ? (
              stats.usersByRole.map((roleGroup) => (
                <div key={roleGroup._id} className="bg-gray-50 p-4 rounded-md">
                  <div className="text-sm font-medium text-gray-500 capitalize">
                    {roleGroup._id}
                  </div>
                  <div className="text-2xl font-semibold text-gray-900 mt-1">
                    {roleGroup.count}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No user role data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/approvals"
            className="border border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-center">
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Review Items</h3>
            <p className="mt-1 text-xs text-gray-500">Approve pending content</p>
          </Link>
          
          <Link
            to="/admin/users"
            className="border border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-center">
              <UserGroupIcon className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Manage Users</h3>
            <p className="mt-1 text-xs text-gray-500">View and manage users</p>
          </Link>
          
          <Link
            to="/admin/courses"
            className="border border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-center">
              <AcademicCapIcon className="h-8 w-8 text-purple-500" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Manage Courses</h3>
            <p className="mt-1 text-xs text-gray-500">View all courses</p>
          </Link>
          
          <Link
            to="/admin/analytics"
            className="border border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-center">
              <ChartBarIcon className="h-8 w-8 text-indigo-500" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Analytics</h3>
            <p className="mt-1 text-xs text-gray-500">View platform analytics</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;