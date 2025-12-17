import { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import { UserGroupIcon, BookOpenIcon, ChatBubbleLeftRightIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboardStats();

      // Map the actual API response to the dashboard format
      const actualData = {
        stats: {
          totalUsers: response.data.data.totalUsers,
          totalCourses: response.data.data.totalCourses,
          totalQuests: response.data.data.totalQuests,
          totalEnrollments: 0, // This field doesn't exist in the API, so defaulting to 0
        },
        pendingItems: {
          pendingCourses: response.data.data.pendingCourses,
          pendingQuests: response.data.data.pendingQuests,
          pendingUsers: response.data.data.pendingUsers
        },
        recentActivities: response.data.data.recentActivities
      };

      setDashboardData(actualData);
      setError('');
    } catch (err) {
      setError('Failed to load dashboard data. Please try again later.');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  
  if (error) return <Alert type="error" message={error} />;

  if (!dashboardData) return <div>No dashboard data available</div>;

  const { stats, pendingItems } = dashboardData;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <BookOpenIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Total Courses</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Total Quests</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.totalQuests}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100">
              <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Enrollments</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEnrollments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Courses</h3>
          <p className="text-3xl font-bold text-orange-600">{pendingItems.pendingCourses}</p>
          <a href="/admin/approvals" className="mt-2 text-primary-600 hover:text-primary-800 text-sm inline-block">
            Review pending courses
          </a>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Quests</h3>
          <p className="text-3xl font-bold text-orange-600">{pendingItems.pendingQuests}</p>
          <a href="/admin/approvals" className="mt-2 text-primary-600 hover:text-primary-800 text-sm inline-block">
            Review pending quests
          </a>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Users</h3>
          <p className="text-3xl font-bold text-orange-600">{pendingItems.pendingUsers}</p>
          <a href="/admin/users" className="mt-2 text-primary-600 hover:text-primary-800 text-sm inline-block">
            Review pending users
          </a>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <a href="/admin/users" className="btn btn-primary">
            Manage Users
          </a>
          <a href="/admin/approvals" className="btn btn-secondary">
            Review Pending Items
          </a>
          <a href="/admin/courses" className="btn btn-secondary">
            Manage Courses
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {dashboardData && dashboardData.recentActivities && dashboardData.recentActivities.length > 0 ? (
            dashboardData.recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start">
                <div className="bg-gray-200 rounded-full h-8 w-8 flex items-center justify-center">
                  <span className="text-gray-700 font-medium">
                    {activity.user ? activity.user.name.charAt(0) :
                     activity.course ? activity.course.title.charAt(0) :
                     activity.quest ? activity.quest.title.charAt(0) : 'A'}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(activity.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No recent activities found</p>
          )}
        </div>
      </div>
    </div>
  );
}