import { useState, useEffect } from 'react';
import { adminAPI, coursesAPI } from '../../utils/api';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import CourseCard from '../../components/common/CourseCard';

export default function AllCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllCourses();
      setCourses(response.data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load courses. Please try again later.');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle course publishing/unpublishing
  const handleTogglePublish = async (courseId, isPublished) => {
    try {
      if (isPublished) {
        await adminAPI.publishCourse(courseId);
      } else {
        await adminAPI.unpublishCourse(courseId);
      }
      // Refresh the course list
      fetchCourses();
    } catch (err) {
      setError('Failed to update course publication status. Please try again.');
      console.error('Error toggling course publication:', err);
    }
  };

  // Handle course approval
  const handleApproveCourse = async (courseId) => {
    try {
      await adminAPI.approveCourse(courseId);
      // Refresh the course list
      fetchCourses();
    } catch (err) {
      setError('Failed to approve course. Please try again.');
      console.error('Error approving course:', err);
    }
  };

  // Handle course rejection
  const handleRejectCourse = async (courseId) => {
    const reason = prompt('Enter reason for rejection:');
    if (reason) {
      try {
        await adminAPI.rejectCourse(courseId, reason);
        // Refresh the course list
        fetchCourses();
      } catch (err) {
        setError('Failed to reject course. Please try again.');
        console.error('Error rejecting course:', err);
      }
    }
  };

  if (loading) return <Loading />;

  if (error) return <Alert type="error" message={error} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">All Courses</h1>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search courses by title, description, category, or creator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

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
          {courses
            .filter(course => {
              // Apply active tab filter
              if (activeTab === 'all') {
                // No filter needed for "all"
              } else if (activeTab === 'published' && !course.isPublished) {
                return false;
              } else if (activeTab === 'unpublished' && course.isPublished) {
                return false;
              }

              // Apply search filter if query exists
              if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const title = course.title.toLowerCase();
                const description = course.description.toLowerCase();
                const category = course.category.toLowerCase();
                const creatorName = (course.creator?.name || '').toLowerCase();

                // Check if search query matches any of the fields
                return (
                  title.includes(query) ||
                  description.includes(query) ||
                  category.includes(query) ||
                  creatorName.includes(query)
                );
              }

              return true;
            })
            .map(course => (
            <div key={course._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="bg-gray-200 w-full h-48 flex items-center justify-center">
                  <span className="text-gray-500">No image</span>
                </div>
              )}

              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                  {course.price?.amount > 0 ? (
                    <span className="text-lg font-bold text-primary-600">
                      ${typeof course.price === 'object' ? course.price.amount : course.price}
                    </span>
                  ) : (
                    <span className="text-lg font-bold text-green-600">Free</span>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    course.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                    course.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {course.difficulty}
                  </span>

                  {course.rating && (
                    <div className="flex items-center">
                      <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-xs text-gray-600 ml-1">{course.rating.average?.toFixed(1)} ({course.rating.count})</span>
                    </div>
                  )}

                  <div className="flex items-center">
                    <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-xs text-gray-600 ml-1">{course.enrollmentCount || 0}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    By {course.creator?.name || 'Unknown'}
                  </div>

                  <div className="flex space-x-2">
                    <a
                      href={`/courses/${course._id}`}
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = `/courses/${course._id}`;
                      }}
                    >
                      View Course
                    </a>
                    <a
                      href={`/mentor/edit-course/${course._id}`}
                      className="btn btn-primary btn-sm"
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = `/mentor/edit-course/${course._id}`;
                      }}
                    >
                      Edit Course
                    </a>
                    {/* Management Actions Dropdown */}
                    <div className="relative group">
                      <button className="btn btn-sm btn-outline">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                        </svg>
                      </button>
                      <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button
                          onClick={() => handleTogglePublish(course._id, !course.isPublished)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {course.isPublished ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          onClick={() => handleApproveCourse(course._id)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Approve Course
                        </button>
                        <button
                          onClick={() => handleRejectCourse(course._id)}
                          className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                        >
                          Reject Course
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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