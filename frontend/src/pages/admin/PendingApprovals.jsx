import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { adminAPI } from '../../utils/api';
import { toast } from 'react-hot-toast';

// Icons
import { 
  AcademicCapIcon, 
  DocumentTextIcon, 
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  PencilIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

function PendingApprovals() {
  const [activeTab, setActiveTab] = useState('courses'); // courses, quests, pricing

  // Fetch data based on active tab
  const {
    data: pendingData,
    isLoading,
    isError,
    refetch
  } = useQuery(
    ['pendingApprovals', activeTab],
    () => {
      switch(activeTab) {
        case 'courses':
          return adminAPI.getPendingCourses().then(res => res.data.data);
        case 'quests':
          return adminAPI.getPendingQuests().then(res => res.data.data);
        case 'pricing':
          return adminAPI.getPendingPrices().then(res => res.data.data);
        default:
          return [];
      }
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  const handleApprove = async (id) => {
    try {
      let response;
      switch(activeTab) {
        case 'courses':
          response = await adminAPI.approveCourse(id);
          break;
        case 'quests':
          response = await adminAPI.approveQuest(id);
          break;
        case 'pricing':
          response = await adminAPI.approvePrice(id);
          break;
        default:
          throw new Error('Invalid approval type');
      }
      
      if (response.data.success) {
        toast.success(`${activeTab.slice(0, 1).toUpperCase() + activeTab.slice(1).replace(/([A-Z])/g, ' $1')} approved successfully!`);
        refetch(); // Refresh the data
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || `Failed to approve ${activeTab.slice(0, -1)}`;
      toast.error(errorMessage);
    }
  };

  const handleReject = async (id, reason = 'No reason provided') => {
    try {
      let response;
      switch(activeTab) {
        case 'courses':
          response = await adminAPI.rejectCourse(id, reason);
          break;
        case 'quests':
          response = await adminAPI.rejectQuest(id, reason);
          break;
        case 'pricing':
          response = await adminAPI.rejectPrice(id, reason);
          break;
        default:
          throw new Error('Invalid approval type');
      }
      
      if (response.data.success) {
        toast.success(`${activeTab.slice(0, 1).toUpperCase() + activeTab.slice(1).replace(/([A-Z])/g, ' $1')} rejected successfully!`);
        refetch(); // Refresh the data
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || `Failed to reject ${activeTab.slice(0, -1)}`;
      toast.error(errorMessage);
    }
  };

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
          <h2 className="text-xl font-semibold">Error loading pending items</h2>
          <p>Please try again later</p>
        </div>
      </div>
    );
  }

  const renderApprovalButtons = (item) => (
    <div className="flex space-x-2">
      <button
        onClick={() => handleApprove(item._id)}
        className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        <CheckCircleIcon className="h-4 w-4" />
      </button>
      <button
        onClick={() => handleReject(item._id)}
        className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        <XCircleIcon className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and approve pending content requiring administrative action
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('courses')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'courses'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <AcademicCapIcon className="h-4 w-4 mr-1" />
              Pending Courses
            </div>
          </button>
          <button
            onClick={() => setActiveTab('quests')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'quests'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <DocumentTextIcon className="h-4 w-4 mr-1" />
              Pending Assessments
            </div>
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pricing'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-4 w-4 mr-1" />
              Pricing Requests
            </div>
          </button>
        </nav>
      </div>

      {/* Content based on active tab */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {pendingData && pendingData.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {pendingData.map((item) => (
              <li key={item._id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {item.title || item.course?.title || 'Untitled'}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          Pending
                        </span>
                      </div>
                      <div className="mt-2 flex">
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="truncate">{item.description || item.course?.description || 'No description'}</span>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        {activeTab === 'courses' && (
                          <>
                            <span>Creator: {item.creator?.name || 'Unknown'}</span>
                            <span className="mx-2">•</span>
                            <span>Category: {item.category}</span>
                            <span className="mx-2">•</span>
                            <span>Difficulty: {item.difficulty}</span>
                          </>
                        )}
                        {activeTab === 'quests' && (
                          <>
                            <span>Creator: {item.creator?.name || 'Unknown'}</span>
                            <span className="mx-2">•</span>
                            <span>Course: {item.course?.title || 'Unknown'}</span>
                            <span className="mx-2">•</span>
                            <span>Questions: {item.questions?.length || 0}</span>
                          </>
                        )}
                        {activeTab === 'pricing' && (
                          <>
                            <span>Course: {item.title}</span>
                            <span className="mx-2">•</span>
                            <span>Current Price: ${item.price?.amount || 0}</span>
                            <span className="mx-2">•</span>
                            <span>Requested By: {item.price?.proposedBy?.name || 'Unknown'}</span>
                          </>
                        )}
                        <span className="mx-2">•</span>
                        <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {renderApprovalButtons(item)}
                      <button className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-gray-100">
              <CheckCircleIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No pending items</h3>
            <p className="mt-1 text-sm text-gray-500">
              There are no {activeTab} pending for approval at this time.
            </p>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      {pendingData && pendingData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <AcademicCapIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Pending Courses</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {pendingData.filter(item => activeTab === 'courses').length}
                      </div>
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
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Pending Assessments</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {pendingData.filter(item => activeTab === 'quests').length}
                      </div>
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
                  <CurrencyDollarIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Pricing Requests</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {pendingData.filter(item => activeTab === 'pricing').length}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PendingApprovals;