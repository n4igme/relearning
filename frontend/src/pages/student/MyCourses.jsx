import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { studentAPI } from '../../utils/api';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Badge from '../../components/common/Badge';

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, in-progress, completed

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getEnrolledCourses();
      setCourses(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter((enrollment) => {
    if (filter === 'in-progress') return !enrollment.completed;
    if (filter === 'completed') return enrollment.completed;
    return true;
  });

  if (loading) return <Loading text="Loading your courses..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="mt-2 text-gray-600">
            {courses.length} course{courses.length !== 1 ? 's' : ''} enrolled
          </p>
        </div>
        <Link to="/courses" className="btn btn-primary">
          Browse More Courses
        </Link>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Filter Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setFilter('all')}
          className={`pb-4 px-4 font-medium transition-colors ${
            filter === 'all'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All Courses ({courses.length})
        </button>
        <button
          onClick={() => setFilter('in-progress')}
          className={`pb-4 px-4 font-medium transition-colors ${
            filter === 'in-progress'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          In Progress ({courses.filter((c) => !c.completed).length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`pb-4 px-4 font-medium transition-colors ${
            filter === 'completed'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Completed ({courses.filter((c) => c.completed).length})
        </button>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? "You haven't enrolled in any courses yet."
                : filter === 'in-progress'
                ? "You don't have any courses in progress."
                : "You haven't completed any courses yet."}
            </p>
            <Link to="/courses" className="btn btn-primary">
              Explore Courses
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((enrollment) => (
            <Card key={enrollment._id} className="hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {/* Course Info */}
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
                      {enrollment.course.title}
                    </h3>
                    {enrollment.completed && <Badge variant="success">Completed</Badge>}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {enrollment.course.description}
                  </p>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span className="font-semibold">{enrollment.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        enrollment.completed ? 'bg-green-500' : 'bg-primary-600'
                      }`}
                      style={{ width: `${enrollment.progress}%` }}
                    />
                  </div>
                </div>

                {/* Course Meta */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <span className="mr-1">📊</span>
                      {enrollment.course.difficulty}
                    </span>
                  </div>
                  <span>
                    Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Action Button */}
                <Link
                  to={`/learn/${enrollment.course._id}`}
                  className={`btn w-full ${
                    enrollment.completed ? 'btn-secondary' : 'btn-primary'
                  }`}
                >
                  {enrollment.completed ? 'Review Course' : 'Continue Learning'}
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
