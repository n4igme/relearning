import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { coursesAPI, adminAPI } from '../../utils/api';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

// Icons
import { 
  AcademicCapIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

function AllCourses() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [loadingStates, setLoadingStates] = useState({});
  const queryClient = useQueryClient();

  // Fetch all courses (admin can see all courses by aggregating data)
  useEffect(() => {
    const fetchAllCourses = async () => {
      setIsLoading(true);
      setIsError(false);
      
      try {
        // Get pending courses from admin API
        const pendingResponse = await adminAPI.getPendingCourses();
        const pendingCourses = pendingResponse.data.data || [];

        // Get all courses that might be approved (not pending)
        const allCoursesResponse = await coursesAPI.getAll({ status: 'all' });
        const allCourses = allCoursesResponse.data.data || [];

        // Combine all courses
        // Note: There might be overlap between pending and all courses
        // Let's merge them while avoiding duplicates
        const allCourseIds = new Set();
        const combinedCourses = [];

        // Add pending courses first
        pendingCourses.forEach(course => {
          if (!allCourseIds.has(course._id)) {
            combinedCourses.push(course);
            allCourseIds.add(course._id);
          }
        });

        // Add other courses
        allCourses.forEach(course => {
          if (!allCourseIds.has(course._id)) {
            combinedCourses.push(course);
            allCourseIds.add(course._id);
          }
        });

        setCourses(combinedCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
        // If admin API fails, try to get courses as a mentor
        try {
          const response = await coursesAPI.getMyCourses();
          setCourses(response.data.data || []);
        } catch (fallbackError) {
          console.error('Could not fetch courses:', fallbackError);
          setIsError(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllCourses();
  }, []);

  useEffect(() => {
    // Apply filters
    let result = courses || [];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.creator?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(course => course.approvalStatus === statusFilter);
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(course => course.category === categoryFilter);
    }
    
    setFilteredCourses(result);
  }, [courses, searchTerm, statusFilter, categoryFilter]);

  const handleApprove = async (courseId) => {
    setLoadingStates(prev => ({ ...prev, [courseId]: 'approve' }));
    try {
      const response = await adminAPI.approveCourse(courseId);
      if (response.data.success) {
        toast.success('Course approved successfully');
        queryClient.invalidateQueries('allCourses'); // Update the cache
        // Refresh local state as well since we're not directly using react-query for this component
        setCourses(prev => prev.map(course => 
          course._id === courseId ? { ...course, approvalStatus: 'approved' } : course
        ));
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to approve course';
      toast.error(errorMessage);
    } finally {
      setLoadingStates(prev => ({ ...prev, [courseId]: null }));
    }
  };

  const handleReject = async (courseId) => {
    setLoadingStates(prev => ({ ...prev, [courseId]: 'reject' }));
    try {
      const response = await adminAPI.rejectCourse(courseId, 'Admin rejected'); // Need to provide a reason
      if (response.data.success) {
        toast.success('Course rejected successfully');
        queryClient.invalidateQueries('allCourses'); // Update the cache
        // Refresh local state as well since we're not directly using react-query for this component
        setCourses(prev => prev.map(course => 
          course._id === courseId ? { ...course, approvalStatus: 'rejected' } : course
        ));
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to reject course';
      toast.error(errorMessage);
    } finally {
      setLoadingStates(prev => ({ ...prev, [courseId]: null }));
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }
    
    setLoadingStates(prev => ({ ...prev, [courseId]: 'delete' }));
    try {
      const response = await coursesAPI.delete(courseId);
      if (response.data.success) {
        toast.success('Course deleted successfully');
        // Update local state to remove the course
        setCourses(prev => prev.filter(course => course._id !== courseId));
        setFilteredCourses(prev => prev.filter(course => course._id !== courseId));
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete course';
      toast.error(errorMessage);
    } finally {
      setLoadingStates(prev => ({ ...prev, [courseId]: null }));
    }
  };

  const renderApprovalStatus = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="h-4 w-4 mr-1" />
            Approved
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="h-4 w-4 mr-1" />
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="h-4 w-4 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const renderActionButtons = (course) => {
    const isLoading = loadingStates[course._id];
    
    return (
      <div className="flex space-x-2 justify-end">
        <Link 
          to={`/courses/${course._id}`}
          className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <EyeIcon className="h-4 w-4" />
        </Link>
        
        {course.approvalStatus === 'pending' && (
          <>
            <button
              onClick={() => handleApprove(course._id)}
              disabled={isLoading}
              className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isLoading === 'approve' ? (
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircleIcon className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={() => handleReject(course._id)}
              disabled={isLoading}
              className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isLoading === 'reject' ? (
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
              ) : (
                <XCircleIcon className="h-4 w-4" />
              )}
            </button>
          </>
        )}
        
        <button
          onClick={() => handleDelete(course._id)}
          disabled={isLoading}
          className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
        >
          {isLoading === 'delete' ? (
            <ArrowPathIcon className="h-4 w-4 animate-spin" />
          ) : (
            <TrashIcon className="h-4 w-4" />
          )}
        </button>
      </div>
    );
  };

  const categories = [
    'all',
    'programming',
    'design',
    'business',
    'marketing',
    'data-science',
    'other'
  ];

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
          <h2 className="text-xl font-semibold">Error loading courses</h2>
          <p>Please try again later</p>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalCourses = courses.length;
  const approvedCourses = courses.filter(course => course.approvalStatus === 'approved').length;
  const pendingCourses = courses.filter(course => course.approvalStatus === 'pending').length;
  const rejectedCourses = courses.filter(course => course.approvalStatus === 'rejected').length;
  const totalEnrollments = courses.reduce((sum, course) => sum + (course.enrollmentCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage all courses in the eLearning platform
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <AcademicCapIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Courses</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{totalCourses}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <CheckCircleIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Approved Courses</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{approvedCourses}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <ClockIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Courses</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{pendingCourses}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <UserGroupIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Enrollments</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{totalEnrollments}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Courses
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="text"
                id="search"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Search by title, description or creator..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Status Filter
            </label>
            <select
              id="statusFilter"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Category Filter
            </label>
            <select
              id="categoryFilter"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.slice(1).map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {filteredCourses && filteredCourses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Creator
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category & Difficulty
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enrollments
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCourses.map((course) => (
                  <tr key={course._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{course.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-2">{course.description}</div>
                      <div className="text-xs text-gray-400">
                        Created: {new Date(course.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{course.creator?.name || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{course.creator?.email || 'No email'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">{course.category}</div>
                      <div className="text-sm text-gray-500 capitalize">{course.difficulty}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderApprovalStatus(course.approvalStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <UserGroupIcon className="h-4 w-4 mr-1 text-gray-400" />
                        {course.enrollmentCount || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <CurrencyDollarIcon className="h-4 w-4 mr-1 text-gray-400" />
                        {course.price?.amount ? `$${course.price.amount}` : 'Free'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {renderActionButtons(course)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-gray-100">
              <AcademicCapIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No courses found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' 
                ? 'No courses match your current filters.' 
                : 'There are no courses in the system yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AllCourses;