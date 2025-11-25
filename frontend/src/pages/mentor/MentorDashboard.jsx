import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { coursesAPI, questsAPI } from '../../utils/api';
import useAuthStore from '../../store/authStore';
import { Link } from 'react-router-dom';

// Icons
import { 
  AcademicCapIcon, 
  ChartBarIcon, 
  DocumentTextIcon, 
  UserGroupIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

function MentorDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalEnrollments: 0,
    pendingCourses: 0,
    totalQuests: 0
  });

  // Fetch mentor's courses
  const { data: courses, isLoading: coursesLoading } = useQuery(
    'mentorCourses',
    () => coursesAPI.getMyCourses().then(res => res.data.data),
    {
      enabled: !!user,
      refetchOnWindowFocus: false,
    }
  );

  // Fetch mentor's quests
  const { data: quests, isLoading: questsLoading } = useQuery(
    'mentorQuests',
    () => questsAPI.getMyQuests().then(res => res.data.data),
    {
      enabled: !!user,
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (courses) {
      const pendingCourses = courses.filter(course => course.approvalStatus === 'pending').length;
      const totalEnrollments = courses.reduce((sum, course) => sum + course.enrollmentCount, 0);
      
      setStats(prev => ({
        ...prev,
        totalCourses: courses.length,
        pendingCourses,
        totalEnrollments
      }));
    }
  }, [courses]);

  useEffect(() => {
    if (quests) {
      setStats(prev => ({
        ...prev,
        totalQuests: quests.length
      }));
    }
  }, [quests]);

  if (coursesLoading || questsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {user?.name}!</h1>
        <p className="mt-1 opacity-90">Here's what's happening with your courses today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    <div className="text-2xl font-semibold text-gray-900">{stats.totalCourses}</div>
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
                <UserGroupIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Enrollments</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats.totalEnrollments}</div>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Review</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats.pendingCourses}</div>
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
                <DocumentTextIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Assessments</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats.totalQuests}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/mentor/content"
            className="border border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-center">
              <AcademicCapIcon className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Manage Content</h3>
            <p className="mt-1 text-xs text-gray-500">View and edit your courses</p>
          </Link>
          
          <Link
            to="/mentor/create-course"
            className="border border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-center">
              <PlusIcon className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Create Course</h3>
            <p className="mt-1 text-xs text-gray-500">Add a new course</p>
          </Link>
          
          <Link
            to="/mentor/create-quest"
            className="border border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-center">
              <DocumentTextIcon className="h-8 w-8 text-purple-500" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Create Assessment</h3>
            <p className="mt-1 text-xs text-gray-500">Add a new quiz</p>
          </Link>
          
          <Link
            to="/mentor/analytics"
            className="border border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-center">
              <ChartBarIcon className="h-8 w-8 text-indigo-500" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">View Analytics</h3>
            <p className="mt-1 text-xs text-gray-500">See performance metrics</p>
          </Link>
        </div>
      </div>

      {/* Recent Courses */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Courses</h3>
          <p className="mt-1 text-sm text-gray-500">Latest courses you've created</p>
        </div>
        {courses && courses.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {courses.slice(0, 3).map((course) => (
              <li key={course._id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {course.title}
                        </h3>
                        {course.approvalStatus === 'approved' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Approved
                          </span>
                        ) : course.approvalStatus === 'pending' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Rejected
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex">
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="truncate">{course.description}</span>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <span>Category: {course.category}</span>
                        <span className="mx-2">•</span>
                        <span>Enrollments: {course.enrollmentCount}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/courses/${course._id}`}
                        className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/mentor/edit-course/${course._id}`}
                        className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8">
            <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No courses yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first course.
            </p>
            <div className="mt-6">
              <Link
                to="/mentor/create-course"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Create a course
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MentorDashboard;