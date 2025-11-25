import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { studentAPI } from '../../utils/api';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';

export default function MyCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getCertificates();
      setCertificates(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading text="Loading your certificates..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Certificates</h1>
        <p className="mt-2 text-gray-600">
          {certificates.length} certificate{certificates.length !== 1 ? 's' : ''} earned
        </p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Certificates Grid */}
      {certificates.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No certificates yet</h3>
            <p className="text-gray-600 mb-6">
              Complete quests to earn certificates and showcase your achievements.
            </p>
            <Link to="/courses" className="btn btn-primary">
              Start Learning
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <Card
              key={cert._id}
              className="bg-gradient-to-br from-yellow-50 via-white to-orange-50 border-2 border-gold-300 hover:shadow-xl transition-shadow"
            >
              <div className="text-center space-y-4">
                {/* Certificate Icon */}
                <div className="text-6xl">🏆</div>

                {/* Certificate Details */}
                <div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">
                    {cert.course?.title || 'Course Certificate'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {cert.quest?.title || 'Quest Completion'}
                  </p>
                </div>

                {/* Score Badge */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-100 border-4 border-primary-600">
                  <div>
                    <div className="text-2xl font-bold text-primary-600">{cert.score}</div>
                    <div className="text-xs text-primary-600">Score</div>
                  </div>
                </div>

                {/* Certificate Number */}
                <div className="text-xs text-gray-500 font-mono">
                  Certificate #{cert.certificateNumber}
                </div>

                {/* Issue Date */}
                <div className="text-sm text-gray-600">
                  Issued on {new Date(cert.issuedDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Link
                    to={`/student/certificates/${cert._id}`}
                    className="btn btn-primary flex-1 text-sm"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => window.print()}
                    className="btn btn-secondary flex-1 text-sm"
                  >
                    Download
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {certificates.length > 0 && (
        <Card title="Certificate Statistics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">{certificates.length}</div>
              <div className="text-sm text-gray-600 mt-1">Total Certificates</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {Math.round(
                  certificates.reduce((sum, cert) => sum + cert.score, 0) / certificates.length
                )}
                %
              </div>
              <div className="text-sm text-gray-600 mt-1">Average Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {certificates.filter((cert) => cert.score >= 90).length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Excellent Scores (90+)</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
