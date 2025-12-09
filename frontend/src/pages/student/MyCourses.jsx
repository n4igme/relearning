import { useState, useEffect } from 'react';
import { studentAPI } from '../../utils/api';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import CourseCard from '../../components/common/CourseCard';

export default function MyCourses() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getEnrolledCourses();
      setEnrolledCourses(response.data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load enrolled courses. Please try again later.');
      console.error('Error fetching enrolled courses:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  
  if (error) return <Alert type="error" message={error} />;

  // Filter courses based on active tab
  const filteredCourses = enrolledCourses.filter(course => {
    if (activeTab === 'all') return true;
    if (activeTab === 'in-progress') return !course.completed && course.progress > 0;
    if (activeTab === 'completed') return course.completed;
    if (activeTab === 'not-started') return !course.completed && course.progress === 0;
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Courses</h1>
      
      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Courses
              <span className="ml-1 bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
                {enrolledCourses.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('in-progress')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'in-progress'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              In Progress
              <span className="ml-1 bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
                {enrolledCourses.filter(c => !c.completed && c.progress > 0).length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('not-started')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'not-started'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Not Started
              <span className="ml-1 bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
                {enrolledCourses.filter(c => !c.completed && c.progress === 0).length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'completed'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Completed
              <span className="ml-1 bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
                {enrolledCourses.filter(c => c.completed).length}
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* Course List */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <CourseCard 
              key={course._id} 
              course={course} 
              userProgress={{ progress: course.progress }} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'all' ? 'No courses enrolled' : 
             activeTab === 'in-progress' ? 'No courses in progress' : 
             activeTab === 'completed' ? 'No completed courses' : 
             'No courses started yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {activeTab === 'all' 
              ? 'Enroll in a course to get started' 
              : 'Start learning one of your enrolled courses'}
          </p>
          {activeTab === 'all' && (
            <a href="/courses" className="btn btn-primary">
              Browse Courses
            </a>
          )}
        </div>
      )}
    </div>
  );
}