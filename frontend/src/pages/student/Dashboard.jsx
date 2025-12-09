import { useState, useEffect } from 'react';
import { studentAPI } from '../../utils/api';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import CourseCard from '../../components/common/CourseCard';
import ProgressBar from '../../components/common/ProgressBar';

export default function StudentDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // We'll fetch multiple endpoints to get the dashboard data
      const enrolledCoursesResponse = await studentAPI.getEnrolledCourses();
      
      const dashboardData = {
        enrolledCourses: enrolledCoursesResponse.data.data || []
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

  const { enrolledCourses } = dashboardData;

  // Calculate overall progress
  const totalCourses = enrolledCourses.length;
  const completedCourses = enrolledCourses.filter(course => course.completed).length;
  const overallProgress = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Student Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Enrolled Courses</h3>
          <p className="text-3xl font-bold text-primary-600">{totalCourses}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Completed Courses</h3>
          <p className="text-3xl font-bold text-green-600">{completedCourses}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Overall Progress</h3>
          <p className="text-3xl font-bold text-purple-600">{overallProgress}%</p>
          <ProgressBar value={overallProgress} max={100} className="mt-2" />
        </div>
      </div>

      {/* Continue Learning */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Continue Learning</h2>
        
        {enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses
              .filter(course => !course.completed)
              .map(course => (
                <CourseCard 
                  key={course._id} 
                  course={course} 
                  userProgress={{ progress: course.progress }} 
                />
              ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses enrolled</h3>
            <p className="text-gray-600 mb-4">Start learning by enrolling in a course</p>
            <a href="/courses" className="btn btn-primary">
              Browse Courses
            </a>
          </div>
        )}
      </div>

      {/* Recently Completed */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recently Completed</h2>
        
        {enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses
              .filter(course => course.completed)
              .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
              .slice(0, 3)
              .map(course => (
                <CourseCard 
                  key={course._id} 
                  course={course} 
                  userProgress={{ progress: 100 }} 
                />
              ))}
          </div>
        ) : (
          <p className="text-gray-600">No completed courses yet. Keep learning to see them here!</p>
        )}
      </div>
    </div>
  );
}