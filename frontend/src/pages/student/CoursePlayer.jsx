import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useCourseStore from '../../store/courseStore';
import useProgressStore from '../../store/progressStore';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';

export default function CoursePlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { getCourseMaterials, courseMaterials } = useCourseStore();
  const { markMaterialComplete, getCourseProgress } = useProgressStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeMaterialIndex, setActiveMaterialIndex] = useState(0);
  const [progress, setProgress] = useState({});

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        await getCourseMaterials(courseId);
        setLoading(false);
      } catch (err) {
        setError(err.error || 'Failed to load course materials');
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [courseId, getCourseMaterials]);

  useEffect(() => {
    const progress = getCourseProgress(courseId);
    if (progress) {
      setProgress(progress);
    }
  }, [courseId, getCourseProgress]);

  const materials = courseMaterials[courseId] || [];

  if (loading) return <Loading />;
  if (error) return <Alert type="error" message={error} />;

  const currentMaterial = materials[activeMaterialIndex];

  if (!currentMaterial) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert type="error" message="No materials available for this course." />
        <div className="mt-4 text-center">
          <Link to={`/courses/${courseId}`} className="text-primary-600 hover:text-primary-700">
            Back to Course
          </Link>
        </div>
      </div>
    );
  }

  const handleMarkComplete = async () => {
    if (!currentMaterial.subMaterials[0]) return;
    
    try {
      await markMaterialComplete(currentMaterial.subMaterials[0]._id, courseId);
      // Move to next material if available
      if (activeMaterialIndex < materials.length - 1) {
        setActiveMaterialIndex(activeMaterialIndex + 1);
      }
    } catch (err) {
      setError(err.error || 'Failed to mark material as complete');
    }
  };

  const canTakeQuest = progress.progressPercentage >= 100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="lg:flex lg:gap-8">
        {/* Sidebar - Table of Contents */}
        <div className="lg:w-1/4">
          <div className="bg-white rounded-lg shadow p-4 sticky top-4">
            <h3 className="font-medium text-gray-900 mb-3">Course Content</h3>
            <div className="space-y-2">
              {materials.map((material, index) => (
                <div 
                  key={material._id}
                  className={`p-3 rounded-lg cursor-pointer ${
                    index === activeMaterialIndex 
                      ? 'bg-primary-50 border border-primary-200' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveMaterialIndex(index)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{material.title}</span>
                    <div className="flex items-center">
                      {material.subMaterials[0]?.completed && (
                        <svg className="w-4 h-4 text-green-600 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{material.subMaterials.length} items</p>
                </div>
              ))}
            </div>
            
            {/* Progress bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Progress</span>
                <span className="text-gray-900">{progress.progressPercentage || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full" 
                  style={{ width: `${progress.progressPercentage || 0}%` }}
                ></div>
              </div>
              
              {canTakeQuest && (
                <button
                  onClick={() => navigate(`/quest/${currentMaterial._id}`)}
                  className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Take Quest
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:w-3/4 mt-6 lg:mt-0">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{currentMaterial.title}</h1>
              <p className="text-gray-600 mb-6">{currentMaterial.description}</p>
              
              {/* Material Content */}
              {currentMaterial.content && (
                <div className="prose max-w-none mb-6">
                  {currentMaterial.content}
                </div>
              )}
              
              {/* Navigation */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setActiveMaterialIndex(Math.max(0, activeMaterialIndex - 1))}
                  disabled={activeMaterialIndex === 0}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
                >
                  Previous
                </button>
                
                <button
                  onClick={handleMarkComplete}
                  disabled={currentMaterial.subMaterials[0]?.completed}
                  className={`px-6 py-2 rounded-lg ${
                    currentMaterial.subMaterials[0]?.completed
                      ? 'bg-green-100 text-green-800 cursor-not-allowed'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {currentMaterial.subMaterials[0]?.completed ? 'Completed' : 'Mark Complete'}
                </button>
                
                <button
                  onClick={() => setActiveMaterialIndex(Math.min(materials.length - 1, activeMaterialIndex + 1))}
                  disabled={activeMaterialIndex === materials.length - 1}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}