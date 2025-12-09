import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { studentAPI } from '../../utils/api';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import LessonCard from '../../components/common/LessonCard';

export default function CourseMaterials() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourseMaterials();
  }, [courseId]);

  const fetchCourseMaterials = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getCourseMaterials(courseId);
      
      // Access the course and materials from the response
      if (response.data.data && response.data.data.course) {
        setCourse(response.data.data.course);
      }
      
      if (response.data.data && response.data.data.materials) {
        setMaterials(response.data.data.materials);
      }
      
      setError('');
    } catch (err) {
      setError('Failed to load course materials. Please try again later.');
      console.error('Error fetching course materials:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (materialId) => {
    try {
      await studentAPI.completeMaterial(courseId, materialId);
      
      // Update the UI to reflect the change
      setMaterials(prev => prev.map(material => ({
        ...material,
        completed: material._id === materialId ? true : material.completed
      })));
      
      // Update course progress
      fetchCourseMaterials(); // Refresh the data
    } catch (err) {
      setError('Failed to mark material as complete. Please try again.');
      console.error('Error marking material complete:', err);
    }
  };

  if (loading) return <Loading />;
  
  if (error) return <Alert type="error" message={error} />;

  if (!course) return <div>Course not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
        <p className="text-gray-600">{course.description}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Course Content Sidebar */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow p-6 sticky top-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Course Content</h2>
            
            {materials.length > 0 ? (
              <div className="space-y-2">
                {materials
                  .sort((a, b) => a.order - b.order)
                  .map((material, materialIndex) => (
                    <div key={material._id} className="border-l-4 border-primary-500 pl-4 py-2">
                      <h3 className="font-medium text-gray-900">{material.title}</h3>
                      {material.description && (
                        <p className="text-sm text-gray-600 mb-3">{material.description}</p>
                      )}
                      
                      <div className="ml-4 space-y-2">
                        {material.subMaterials
                          .sort((a, b) => a.order - b.order)
                          .map((subMaterial, subIndex) => (
                            <LessonCard
                              key={subMaterial._id}
                              lesson={{
                                ...subMaterial,
                                type: subMaterial.type,
                                duration: subMaterial.duration,
                                title: subMaterial.title,
                                content: subMaterial.content,
                                url: subMaterial.url,
                                order: subIndex + 1
                              }}
                              courseId={courseId}
                              isCompleted={subMaterial.completed || false}
                              onMarkComplete={handleMarkComplete}
                            />
                          ))}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-600">No course content available yet.</p>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Learning Path</h2>
            
            <div className="space-y-4">
              {materials
                .sort((a, b) => a.order - b.order)
                .map((material) => (
                  <div key={material._id} className="border rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">{material.title}</h3>
                    
                    {material.description && (
                      <p className="text-gray-600 mb-4">{material.description}</p>
                    )}
                    
                    <div className="ml-4 space-y-2">
                      {material.subMaterials
                        .sort((a, b) => a.order - b.order)
                        .map((subMaterial, index) => (
                          <LessonCard
                            key={subMaterial._id}
                            lesson={{
                              ...subMaterial,
                              type: subMaterial.type,
                              duration: subMaterial.duration,
                              title: subMaterial.title,
                              content: subMaterial.content,
                              url: subMaterial.url,
                              order: index + 1
                            }}
                            courseId={courseId}
                            isCompleted={subMaterial.completed || false}
                            onMarkComplete={handleMarkComplete}
                          />
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}