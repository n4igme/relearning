import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentAPI, questsAPI } from '../../utils/api';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function CoursePlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [courseData, setCourseData] = useState(null);
  const [courseQuests, setCourseQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubMaterial, setSelectedSubMaterial] = useState(null);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      // Fetch both course materials and quests
      const [materialsResponse, questsResponse] = await Promise.all([
        studentAPI.getCourseMaterials(courseId),
        questsAPI.getCourseQuests(courseId) // Fetch quests for this course
      ]);

      setCourseData(materialsResponse.data.data);
      setCourseQuests(questsResponse.data.data); // Store available quests

      // Select the first sub-material by default
      if (materialsResponse.data.data.materials &&
          materialsResponse.data.data.materials.length > 0 &&
          materialsResponse.data.data.materials[0].subMaterials &&
          materialsResponse.data.data.materials[0].subMaterials.length > 0) {
        setSelectedSubMaterial({
          ...materialsResponse.data.data.materials[0].subMaterials[0],
          materialId: materialsResponse.data.data.materials[0]._id
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load course content');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteMaterial = async () => {
    if (!selectedSubMaterial) return;

    try {
      // Use the materialId from the selectedSubMaterial object which was set when selecting
      await studentAPI.completeMaterial(courseId, selectedSubMaterial.materialId, selectedSubMaterial._id);
      toast.success('Material marked as complete!');
      // Refetch data to update progress
      fetchCourseData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark as complete');
    }
  };

  if (loading) return <Loading text="Loading course..." />;
  if (error) return <Alert type="error" message={error} />;
  if (!courseData) return <Alert type="info" message="No course data found." />;

  // Calculate if all materials are completed based on materialsProgress
  const allMaterialsCompleted = courseData.allMaterialsCompleted;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 bg-white border-r overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold">{courseData.course?.title}</h2>
          <p className="text-sm text-gray-600">{Math.round(courseData.progress || 0)}% Complete</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${courseData.progress || 0}%` }}></div>
          </div>
        </div>
        <nav>
          <ul>
            {courseData.materials?.map((material) => (
              <li key={material._id}>
                <h3 className="p-4 font-semibold text-gray-800">{material.title}</h3>
                <ul>
                  {material.subMaterials?.map((sub) => (
                    <li
                      key={sub._id}
                      className={`border-l-4 ${selectedSubMaterial?._id === sub._id ? 'border-blue-500 bg-blue-50' : 'border-transparent'}`}
                    >
                      <button
                        onClick={() => setSelectedSubMaterial({...sub, materialId: material._id})}
                        className="w-full text-left p-4 text-sm flex items-center"
                      >
                        <span className={`mr-2 ${sub.completed ? 'text-green-500' : 'text-gray-400'}`}>
                          {sub.completed ? '✓' : '○'}
                        </span>
                        {sub.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-8 overflow-y-auto">
        {selectedSubMaterial ? (
          <div>
            <h1 className="text-2xl font-bold mb-4">{selectedSubMaterial.title}</h1>
            <div className="prose max-w-none">
              {selectedSubMaterial.type === 'video' && selectedSubMaterial.url ? (
                <div style={{position: 'relative', paddingBottom: '56.25%', height: 0}}>
                  <iframe
                    src={selectedSubMaterial.url?.replace("watch?v=", "embed/") || selectedSubMaterial.url}
                    frameBorder="0"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}
                  ></iframe>
                </div>
              ) : selectedSubMaterial.type === 'article' ? (
                <div dangerouslySetInnerHTML={{ __html: selectedSubMaterial.content || selectedSubMaterial.description || 'No content available' }} />
              ) : (
                <>
                  {selectedSubMaterial.content || selectedSubMaterial.description ? (
                    <p>{selectedSubMaterial.content || selectedSubMaterial.description}</p>
                  ) : selectedSubMaterial.url ? (
                    <a href={selectedSubMaterial.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {selectedSubMaterial.url}
                    </a>
                  ) : (
                    <p>No content available for this material.</p>
                  )}
                </>
              )}
            </div>
            <div className="mt-8">
              {!selectedSubMaterial.completed && (
                <Button onClick={handleCompleteMaterial}>
                  Mark as Complete
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-xl font-semibold">Select a material to begin</h2>
            <p>Choose a lesson from the sidebar to start your learning journey.</p>
          </div>
        )}

        {allMaterialsCompleted && courseQuests.length > 0 && (
          <Card className="mt-8 text-center">
            <h2 className="text-xl font-bold">You've completed the materials!</h2>
            <p className="my-4">You're ready to take the final quest to earn your certificate.</p>
            <Button
              onClick={() => navigate(`/student/quests/${courseQuests[0]?._id}`)}
              variant="primary"
            >
              Take the Quest
            </Button>
          </Card>
        )}
        {allMaterialsCompleted && courseQuests.length === 0 && (
          <Card className="mt-8 text-center">
            <h2 className="text-xl font-bold">Course Completed!</h2>
            <p className="my-4">You've completed all the materials. There are no quests available for this course.</p>
            <Button onClick={() => navigate('/student/my-courses')} variant="secondary">
              Back to My Courses
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}