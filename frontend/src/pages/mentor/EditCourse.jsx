import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coursesAPI } from '../../utils/api';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';

export default function EditCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // State for managing course materials
  const [materialForm, setMaterialForm] = useState({
    title: '',
    description: '',
    order: 1
  });

  // State for managing sub-materials (lessons within a material)
  const [subMaterialForm, setSubMaterialForm] = useState({
    title: '',
    type: 'video',
    content: '',
    duration: 0,
    url: '',
    order: 1
  });

  // Selected material for adding sub-materials
  const [selectedMaterialId, setSelectedMaterialId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    price: { amount: 0, currency: 'USD' },
    thumbnail: '',
    isPublished: false,
    materials: [] // Initialize materials array
  });

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getOne(courseId);
      const courseData = response.data.data;
      setCourse(courseData);

      // Set form data with course data
      setFormData({
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        difficulty: courseData.difficulty,
        price: courseData.price || { amount: 0, currency: 'USD' },
        thumbnail: courseData.thumbnail,
        isPublished: courseData.isPublished,
        materials: courseData.materials || [] // Load materials from course data
      });

      setError('');
    } catch (err) {
      setError('Failed to load course. Please try again later.');
      console.error('Error fetching course:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name, value) => {
    if (name === 'price.amount') {
      setFormData(prev => ({
        ...prev,
        price: {
          ...prev.price,
          amount: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleMaterialChange = (name, value) => {
    setMaterialForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubMaterialChange = (name, value) => {
    setSubMaterialForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add a new material (section/chapter)
  const addMaterial = () => {
    if (!materialForm.title.trim()) {
      setError('Material title is required');
      return;
    }

    const newMaterial = {
      _id: Date.now().toString(), // Temporary ID until saved
      title: materialForm.title,
      description: materialForm.description,
      order: materialForm.order,
      subMaterials: [],
      isNew: true // Flag to indicate this is a new material
    };

    setFormData(prev => ({
      ...prev,
      materials: [...prev.materials, newMaterial]
    }));

    // Reset form
    setMaterialForm({
      title: '',
      description: '',
      order: prev => prev.order + 1
    });

    setError('');
  };

  // Add a sub-material (lesson/component) to a material
  const addSubMaterial = (materialId) => {
    if (!subMaterialForm.title.trim()) {
      setError('Sub-material title is required');
      return;
    }

    setFormData(prev => ({
      ...prev,
      materials: prev.materials.map(material => {
        if (material._id === materialId) {
          return {
            ...material,
            subMaterials: [
              ...material.subMaterials,
              {
                _id: Date.now().toString(), // Temporary ID until saved
                title: subMaterialForm.title,
                type: subMaterialForm.type,
                content: subMaterialForm.content,
                duration: subMaterialForm.duration,
                url: subMaterialForm.url,
                order: subMaterialForm.order,
                isNew: true // Flag to indicate this is a new sub-material
              }
            ]
          };
        }
        return material;
      })
    }));

    // Reset form
    setSubMaterialForm({
      title: '',
      type: 'video',
      content: '',
      duration: 0,
      url: '',
      order: prev => prev.order + 1
    });

    setError('');
  };

  // Remove a material
  const removeMaterial = (materialId) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter(material => material._id !== materialId)
    }));
  };

  // Remove a sub-material
  const removeSubMaterial = (materialId, subMaterialId) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.map(material => {
        if (material._id === materialId) {
          return {
            ...material,
            subMaterials: material.subMaterials.filter(sub => sub._id !== subMaterialId)
          };
        }
        return material;
      })
    }));
  };

  // Update an existing material
  const updateMaterial = (materialId, field, value) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.map(material =>
        material._id === materialId
          ? { ...material, [field]: value, isModified: true } // Flag as modified
          : material
      )
    }));
  };

  // Update an existing sub-material
  const updateSubMaterial = (materialId, subMaterialId, field, value) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.map(material => {
        if (material._id === materialId) {
          return {
            ...material,
            subMaterials: material.subMaterials.map(sub =>
              sub._id === subMaterialId
                ? { ...sub, [field]: value, isModified: true } // Flag as modified
                : sub
            )
          };
        }
        return material;
      })
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      // Update the basic course information along with materials
      const courseUpdateData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        difficulty: formData.difficulty,
        price: formData.price,
        thumbnail: formData.thumbnail,
        isPublished: formData.isPublished,
        materials: formData.materials.map(material => ({
          // Only send fields that are needed for the update
          _id: material._id,
          title: material.title,
          description: material.description,
          order: material.order,
          subMaterials: material.subMaterials ? material.subMaterials.map(sub => ({
            _id: sub._id,
            title: sub.title,
            type: sub.type,
            content: sub.content,
            duration: sub.duration,
            url: sub.url,
            order: sub.order
          })) : []
        }))
      };

      await coursesAPI.update(courseId, courseUpdateData);
      setSuccess('Course updated successfully!');

      // Refresh course data
      fetchCourse();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update course. Please try again.');
      console.error('Error updating course:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;
  
  if (error) return <Alert type="error" message={error} />;

  if (!course) return <div>Course not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Course</h1>
      
      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}
      
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-6">
            <div>
              <Input
                label="Course Title"
                name="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Enter course title"
                required
              />
            </div>
            
            <div>
              <Textarea
                label="Course Description"
                name="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Enter course description"
                required
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Select
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  options={[
                    { value: 'programming', label: 'Programming' },
                    { value: 'design', label: 'Design' },
                    { value: 'business', label: 'Business' },
                    { value: 'marketing', label: 'Marketing' },
                    { value: 'data-science', label: 'Data Science' },
                    { value: 'other', label: 'Other' }
                  ]}
                  required
                />
              </div>
              
              <div>
                <Select
                  label="Difficulty Level"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={(e) => handleChange('difficulty', e.target.value)}
                  options={[
                    { value: 'beginner', label: 'Beginner' },
                    { value: 'intermediate', label: 'Intermediate' },
                    { value: 'advanced', label: 'Advanced' }
                  ]}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (USD)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    value={formData.price.amount}
                    onChange={(e) => handleChange('price.amount', parseFloat(e.target.value) || 0)}
                    className="input pl-8 w-full"
                    placeholder="0.00"
                    min="0"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Publish Course
                </label>
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => handleChange('isPublished', e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Make this course publicly available</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div>
              <Input
                label="Thumbnail URL (Optional)"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={(e) => handleChange('thumbnail', e.target.value)}
                placeholder="https://example.com/thumbnail.jpg"
              />
            </div>
          </div>

          {/* Materials Section */}
          <div className="mt-8 border-t pt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Course Materials</h2>

            {/* Add Material Form */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-lg mb-4 text-gray-800">Add New Material (Section/Chapter)</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Material Title</label>
                  <input
                    type="text"
                    value={materialForm.title}
                    onChange={(e) => handleMaterialChange('title', e.target.value)}
                    className="input w-full"
                    placeholder="Chapter title (e.g. Introduction to JavaScript)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                  <input
                    type="number"
                    value={materialForm.order}
                    onChange={(e) => handleMaterialChange('order', parseInt(e.target.value) || 1)}
                    className="input w-full"
                    min="1"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  value={materialForm.description}
                  onChange={(e) => handleMaterialChange('description', e.target.value)}
                  className="input w-full"
                  rows="2"
                  placeholder="Brief description of this material..."
                />
              </div>

              <button
                type="button"
                onClick={addMaterial}
                className="btn btn-primary"
              >
                Add Material
              </button>
            </div>

            {/* Display Materials */}
            <div className="space-y-6">
              {formData.materials.length > 0 ? (
                formData.materials
                  .sort((a, b) => a.order - b.order)
                  .map((material, materialIndex) => (
                    <div key={material._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900 text-lg"> #{material.order}. {material.title}</h4>
                          {material.description && (
                            <p className="text-gray-600 text-sm mt-1">{material.description}</p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSubMaterialForm(prev => ({...prev, order: material.subMaterials.length + 1}));
                              setSelectedMaterialId(material._id);
                            }}
                            className="btn btn-sm btn-secondary"
                          >
                            Add Lesson
                          </button>
                          <button
                            type="button"
                            onClick={() => removeMaterial(material._id)}
                            className="btn btn-sm btn-danger"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Sub-Materials (Lessons) for this Material */}
                      <div className="ml-4 space-y-3">
                        <h5 className="font-medium text-gray-800">Lessons:</h5>
                        {selectedMaterialId === material._id && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Lesson Title</label>
                                <input
                                  type="text"
                                  value={subMaterialForm.title}
                                  onChange={(e) => handleSubMaterialChange('title', e.target.value)}
                                  className="input w-full"
                                  placeholder="Lesson title (e.g. JavaScript Variables)"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                                <select
                                  value={subMaterialForm.type}
                                  onChange={(e) => handleSubMaterialChange('type', e.target.value)}
                                  className="input w-full"
                                >
                                  <option value="video">Video</option>
                                  <option value="article">Article</option>
                                  <option value="assignment">Assignment</option>
                                  <option value="quiz">Quiz</option>
                                  <option value="resource">Resource</option>
                                </select>
                              </div>
                            </div>

                            <div className="mb-3">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                              <textarea
                                value={subMaterialForm.content}
                                onChange={(e) => handleSubMaterialChange('content', e.target.value)}
                                className="input w-full"
                                rows="3"
                                placeholder="Lesson content or description..."
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                                <input
                                  type="number"
                                  value={subMaterialForm.duration}
                                  onChange={(e) => handleSubMaterialChange('duration', parseInt(e.target.value) || 0)}
                                  className="input w-full"
                                  min="0"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">URL (Optional)</label>
                                <input
                                  type="text"
                                  value={subMaterialForm.url}
                                  onChange={(e) => handleSubMaterialChange('url', e.target.value)}
                                  className="input w-full"
                                  placeholder="https://example.com/video"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                                <input
                                  type="number"
                                  value={subMaterialForm.order}
                                  onChange={(e) => handleSubMaterialChange('order', parseInt(e.target.value) || 1)}
                                  className="input w-full"
                                  min="1"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end space-x-2">
                              <button
                                type="button"
                                onClick={() => setSelectedMaterialId(null)}
                                className="btn btn-sm btn-secondary"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => addSubMaterial(material._id)}
                                className="btn btn-sm btn-primary"
                              >
                                Add Lesson
                              </button>
                            </div>
                          </div>
                        )}

                        {material.subMaterials && material.subMaterials.length > 0 ? (
                          <div className="space-y-2">
                            {material.subMaterials
                              .sort((a, b) => a.order - b.order)
                              .map((subMaterial, subIndex) => (
                                <div key={subMaterial._id} className="flex justify-between items-center bg-white p-3 rounded border">
                                  <div className="flex items-center">
                                    <span className="text-gray-500 text-sm">#{subMaterial.order}</span>
                                    <span className="ml-2 font-medium text-gray-900">{subMaterial.title}</span>
                                    <span className="ml-2 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                                      {subMaterial.type}
                                    </span>
                                    {subMaterial.duration > 0 && (
                                      <span className="ml-2 text-xs text-gray-500">
                                        ({subMaterial.duration} min)
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {subMaterial.url && (
                                      <a href={subMaterial.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">
                                        Link
                                      </a>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => removeSubMaterial(material._id, subMaterial._id)}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500">
                            No lessons added yet. Click 'Add Lesson' to create one.
                          </div>
                        )}
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No materials added yet. Create your first material (section/chapter) above.</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/mentor/content')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}