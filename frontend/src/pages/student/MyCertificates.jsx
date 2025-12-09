import { useState, useEffect } from 'react';
import { certificatesAPI } from '../../utils/api';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import { DocumentTextIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

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
      const response = await certificatesAPI.getMyCertificates();
      setCertificates(response.data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load certificates. Please try again later.');
      console.error('Error fetching certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  
  if (error) return <Alert type="error" message={error} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Certificates</h1>
      
      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map(certificate => (
            <div key={certificate._id} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <div className="text-center">
                <DocumentTextIcon className="h-16 w-16 text-primary-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{certificate.course?.title}</h3>
                <p className="text-gray-600 mb-4">Certificate of Completion</p>
                
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                    {certificate.grade}
                  </span>
                </div>
                
                <div className="text-sm text-gray-500 mb-4">
                  <p>Issued: {new Date(certificate.issueDate).toLocaleDateString()}</p>
                  <p>Score: {certificate.score}%</p>
                </div>
                
                <div className="flex justify-center">
                  <button className="btn btn-secondary">
                    View Certificate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates yet</h3>
          <p className="text-gray-600 mb-4">
            Complete courses and pass quests to earn certificates
          </p>
          <a href="/courses" className="btn btn-primary">
            Browse Courses
          </a>
        </div>
      )}
    </div>
  );
}