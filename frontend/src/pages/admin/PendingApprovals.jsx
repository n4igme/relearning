import { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import { BookOpenIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export default function PendingApprovals() {
  const [pendingCourses, setPendingCourses] = useState([]);
  const [pendingQuests, setPendingQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('courses');

  useEffect(() => {
    fetchPendingItems();
  }, []);

  const fetchPendingItems = async () => {
    try {
      setLoading(true);
      
      // Fetch pending courses
      const coursesResponse = await adminAPI.getPendingCourses();
      setPendingCourses(coursesResponse.data.data || []);
      
      // Fetch pending quests
      const questsResponse = await adminAPI.getPendingQuests();
      setPendingQuests(questsResponse.data.data || []);
      
      setError('');
    } catch (err) {
      setError('Failed to load pending items. Please try again later.');
      console.error('Error fetching pending items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCourse = async (courseId) => {
    try {
      await adminAPI.approveCourse(courseId);
      // Refresh the list
      fetchPendingItems();
    } catch (err) {
      setError('Failed to approve course. Please try again.');
      console.error('Error approving course:', err);
    }
  };

  const handleRejectCourse = async (courseId) => {
    const reason = prompt('Enter reason for rejection:');
    if (reason !== null) {
      try {
        await adminAPI.rejectCourse(courseId, reason);
        // Refresh the list
        fetchPendingItems();
      } catch (err) {
        setError('Failed to reject course. Please try again.');
        console.error('Error rejecting course:', err);
      }
    }
  };

  const handleApproveQuest = async (questId) => {
    try {
      await adminAPI.approveQuest(questId);
      // Refresh the list
      fetchPendingItems();
    } catch (err) {
      setError('Failed to approve quest. Please try again.');
      console.error('Error approving quest:', err);
    }
  };

  const handleRejectQuest = async (questId) => {
    const reason = prompt('Enter reason for rejection:');
    if (reason !== null) {
      try {
        await adminAPI.rejectQuest(questId, reason);
        // Refresh the list
        fetchPendingItems();
      } catch (err) {
        setError('Failed to reject quest. Please try again.');
        console.error('Error rejecting quest:', err);
      }
    }
  };

  if (loading) return <Loading />;
  
  if (error) return <Alert type="error" message={error} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Pending Approvals</h1>
      
      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('courses')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'courses'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending Courses
              <span className="ml-1 bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
                {pendingCourses.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('quests')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'quests'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending Quests
              <span className="ml-1 bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
                {pendingQuests.length}
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* Pending Courses */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          {pendingCourses.length > 0 ? (
            pendingCourses.map(course => (
              <div key={course._id} className="bg-white rounded-lg shadow p-6 border border-yellow-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{course.title}</h3>
                    <p className="text-gray-600 mt-1">{course.description}</p>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span>By {course.creator?.name || 'Unknown'}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(course.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApproveCourse(course._id)}
                      className="btn btn-primary"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectCourse(course._id)}
                      className="btn btn-danger"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending courses</h3>
              <p className="text-gray-600">There are no courses awaiting approval.</p>
            </div>
          )}
        </div>
      )}

      {/* Pending Quests */}
      {activeTab === 'quests' && (
        <div className="space-y-6">
          {pendingQuests.length > 0 ? (
            pendingQuests.map(quest => (
              <div key={quest._id} className="bg-white rounded-lg shadow p-6 border border-yellow-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{quest.title}</h3>
                    <p className="text-gray-600 mt-1">{quest.description}</p>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span>For course: {quest.course?.title || 'Unknown'}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(quest.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApproveQuest(quest._id)}
                      className="btn btn-primary"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectQuest(quest._id)}
                      className="btn btn-danger"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending quests</h3>
              <p className="text-gray-600">There are no quests awaiting approval.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}