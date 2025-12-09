import { useState, useEffect } from 'react';
import { forumAPI } from '../../utils/api';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import ForumThreadCard from '../../components/common/ForumThreadCard';

export default function ForumPage() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    course: ''
  });

  useEffect(() => {
    fetchThreads();
  }, [filters]);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      const params = {
        ...(filters.search && { search: filters.search }),
        ...(filters.course && { course: filters.course })
      };
      
      const response = await forumAPI.getCourseQuestions('all', params);
      setThreads(response.data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load forum threads. Please try again later.');
      console.error('Error fetching forum threads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) return <Loading />;
  
  if (error) return <Alert type="error" message={error} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Forum</h1>
        <p className="text-gray-600">Ask questions and help others in the learning community</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search forum threads..."
              className="input w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
            <select
              value={filters.course}
              onChange={(e) => handleFilterChange('course', e.target.value)}
              className="input w-full"
            >
              <option value="">All Courses</option>
              <option value="course1">Sample Course 1</option>
              <option value="course2">Sample Course 2</option>
            </select>
          </div>
        </div>
      </div>

      {/* New Thread Button */}
      <div className="mb-6 text-right">
        <a href="/forum/new" className="btn btn-primary">
          New Thread
        </a>
      </div>

      {/* Thread List */}
      {threads.length > 0 ? (
        <div className="space-y-4">
          {threads.map(thread => (
            <ForumThreadCard key={thread._id} thread={thread} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No forum threads found</h3>
          <p className="text-gray-600 mb-4">Be the first to start a discussion in the forum</p>
          <a href="/forum/new" className="btn btn-primary">
            Create New Thread
          </a>
        </div>
      )}
    </div>
  );
}