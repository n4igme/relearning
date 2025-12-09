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
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    price: { amount: 0, currency: 'USD' },
    thumbnail: '',
    isPublished: false
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
        isPublished: courseData.isPublished
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const courseData = {
        ...formData,
        price: formData.price
      };

      await coursesAPI.update(courseId, courseData);
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