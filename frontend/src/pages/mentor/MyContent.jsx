import { useState, useEffect } from 'react';
import { coursesAPI } from '../../utils/api';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import CourseCard from '../../components/common/CourseCard';
import { PencilIcon, EyeIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function MyContent() {
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
      const response = await coursesAPI.getMyCourses();
      setCourses(response.data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load courses. Please try again later.');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        await coursesAPI.delete(courseId);
        // Refresh the course list
        fetchCourses();
      } catch (err) {
        setError('Failed to delete course. Please try again.');
        console.error('Error deleting course:', err);
      }
    }
  };

  if (loading) return <Loading />;
  
  if (error) return <Alert type="error" message={error} />;

  // Filter courses based on active tab
  const filteredCourses = courses.filter(course => {
    if (activeTab === 'all') return true;
    if (activeTab === 'published') return course.isPublished;
    if (activeTab === 'drafts') return !course.isPublished;
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Content</h1>
      
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
              onClick={() => setActiveTab('drafts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'drafts'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Drafts
              <span className="ml-1 bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
                {courses.filter(c => !c.isPublished).length}
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <a href="/mentor/create-course" className="btn btn-primary">
          Create New Course
        </a>
      </div>

      {/* Course List */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <div key={course._id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
              <CourseCard course={course} />
              
              <div className="flex justify-between mt-4">
                <a 
                  href={`/mentor/edit-course/${course._id}`}
                  className="flex items-center text-primary-600 hover:text-primary-700"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Edit
                </a>
                
                <a 
                  href={`/courses/${course._id}`}
                  className="flex items-center text-gray-600 hover:text-gray-700"
                >
                  <EyeIcon className="h-4 w-4 mr-1" />
                  View
                </a>
                
                <button 
                  onClick={() => handleDeleteCourse(course._id)}
                  className="flex items-center text-red-600 hover:text-red-700"
                >
                  <TrashIcon className="h-4 w-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'all' ? 'No courses created' : 
             activeTab === 'published' ? 'No published courses' : 
             'No draft courses'}
          </h3>
          <p className="text-gray-600 mb-4">
            {activeTab === 'all' 
              ? 'Create your first course to get started' 
              : 'Create a new course or publish an existing draft'}
          </p>
          <a href="/mentor/create-course" className="btn btn-primary">
            Create Course
          </a>
        </div>
      )}
    </div>
  );
}