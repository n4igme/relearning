import { useState, useEffect } from 'react';
import { coursesAPI } from '../../utils/api';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import CourseCard from '../../components/common/CourseCard';
import { BookOpenIcon, UserGroupIcon, ChartBarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

export default function MentorDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch mentor's courses
      const coursesResponse = await coursesAPI.getMyCourses();
      
      const dashboardData = {
        courses: coursesResponse.data.data || [],
      };
      
      setDashboardData(dashboardData);
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

  const { courses } = dashboardData;

  // Calculate stats
  const totalCourses = courses.length;
  const publishedCourses = courses.filter(course => course.isPublished).length;
  const draftCourses = courses.filter(course => !course.isPublished).length;
  const totalEnrollments = courses.reduce((sum, course) => sum + (course.enrollmentCount || 0), 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mentor Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <BookOpenIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Total Courses</h3>
              <p className="text-2xl font-bold text-gray-900">{totalCourses}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <ChartBarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Published</h3>
              <p className="text-2xl font-bold text-gray-900">{publishedCourses}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100">
              <BookOpenIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Drafts</h3>
              <p className="text-2xl font-bold text-gray-900">{draftCourses}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <UserGroupIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Total Students</h3>
              <p className="text-2xl font-bold text-gray-900">{totalEnrollments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <a href="/mentor/create-course" className="btn btn-primary">
            Create New Course
          </a>
          <a href="/mentor/create-quest" className="btn btn-secondary">
            Create Quest
          </a>
          <a href="/mentor/content" className="btn btn-secondary">
            Manage Content
          </a>
        </div>
      </div>

      {/* My Courses */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">My Courses</h2>
        
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.slice(0, 6).map(course => (
              <CourseCard 
                key={course._id} 
                course={course} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses created yet</h3>
            <p className="text-gray-600 mb-4">Start creating your first course to share knowledge</p>
            <a href="/mentor/create-course" className="btn btn-primary">
              Create Course
            </a>
          </div>
        )}
      </div>
    </div>
  );
}