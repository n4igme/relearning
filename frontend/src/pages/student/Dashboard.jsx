import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { studentAPI } from '../../utils/api';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';

export default function StudentDashboard() {
  const [data, setData] = useState({
    courses: [],
    certificates: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [coursesRes, certificatesRes] = await Promise.all([
        studentAPI.getEnrolledCourses(),
        studentAPI.getCertificates()
      ]);

      setData({
        courses: coursesRes.data.data || [],
        certificates: certificatesRes.data.data || [],
        recentActivity: []
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading text="Loading your dashboard..." />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back! Here's your learning progress.</p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100">Enrolled Courses</p>
              <p className="text-3xl font-bold mt-2">{data.courses.length}</p>
            </div>
            <div className="text-4xl">📚</div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100">Certificates Earned</p>
              <p className="text-3xl font-bold mt-2">{data.certificates.length}</p>
            </div>
            <div className="text-4xl">🏆</div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100">Completion Rate</p>
              <p className="text-3xl font-bold mt-2">
                {data.courses.length > 0
                  ? Math.round(
                      (data.courses.filter((c) => c.completed).length / data.courses.length) * 100
                    )
                  : 0}
                %
              </p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </Card>
      </div>

      {/* In Progress Courses */}
      <Card title="Continue Learning" subtitle="Pick up where you left off">
        {data.courses.filter((c) => !c.completed).length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">You haven't enrolled in any courses yet.</p>
            <Link to="/courses" className="btn btn-primary">
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.courses
              .filter((c) => !c.completed)
              .slice(0, 4)
              .map((enrollment) => (
                <div
                  key={enrollment.course._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-gray-900">{enrollment.course.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {enrollment.course.description}
                  </p>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>{enrollment.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${enrollment.progress}%` }}
                      />
                    </div>
                  </div>
                  <Link
                    to={`/learn/${enrollment.course._id}`}
                    className="btn btn-primary mt-4 w-full"
                  >
                    Continue Learning
                  </Link>
                </div>
              ))}
          </div>
        )}
      </Card>

      {/* Recent Certificates */}
      {data.certificates.length > 0 && (
        <Card title="Recent Certificates" subtitle="Your latest achievements">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.certificates.slice(0, 3).map((cert) => (
              <div
                key={cert._id}
                className="border-2 border-gold-400 rounded-lg p-4 bg-gradient-to-br from-yellow-50 to-orange-50"
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">🏆</div>
                  <h4 className="font-semibold text-gray-900">{cert.course.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">Score: {cert.score}%</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(cert.issuedDate).toLocaleDateString()}
                  </p>
                  <Link
                    to={`/student/certificates/${cert._id}`}
                    className="btn btn-secondary mt-3 w-full text-sm"
                  >
                    View Certificate
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
