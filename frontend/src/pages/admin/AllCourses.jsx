import { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import CourseCard from '../../components/common/CourseCard';

export default function AllCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // For now, we'll use sample data until we have the actual API
      const sampleCourses = [
        {
          _id: '1',
          title: 'Introduction to JavaScript',
          description: 'Learn the fundamentals of JavaScript programming',
          creator: { name: 'John Doe' },
          difficulty: 'beginner',
          price: { amount: 49.99 },
          rating: { average: 4.5, count: 120 },
          enrollmentCount: 2500,
          isPublished: true,
          approvalStatus: 'approved'
        },
        {
          _id: '2',
          title: 'Advanced React Patterns',
          description: 'Master advanced React patterns and techniques',
          creator: { name: 'Jane Smith' },
          difficulty: 'advanced',
          price: { amount: 79.99 },
          rating: { average: 4.8, count: 85 },
          enrollmentCount: 1200,
          isPublished: true,
          approvalStatus: 'approved'
        },
        {
          _id: '3',
          title: 'Python for Data Science',
          description: 'Learn Python for data analysis and visualization',
          creator: { name: 'Mike Johnson' },
          difficulty: 'intermediate',
          price: { amount: 0 },
          rating: { average: 4.3, count: 95 },
          enrollmentCount: 1800,
          isPublished: true,
          approvalStatus: 'approved'
        }
      ];
      
      setCourses(sampleCourses);
      setError('');
    } catch (err) {
      setError('Failed to load courses. Please try again later.');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  
  if (error) return <Alert type="error" message={error} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">All Courses</h1>
      
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
                {courses.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('published')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'published'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Published
              <span className="ml-1 bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
                {courses.filter(c => c.isPublished).length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('unpublished')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'unpublished'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Unpublished
              <span className="ml-1 bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
                {courses.filter(c => !c.isPublished).length}
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* Course List */}
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <CourseCard 
              key={course._id} 
              course={course} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600">There are no courses in the system yet.</p>
        </div>
      )}
    </div>
  );
}