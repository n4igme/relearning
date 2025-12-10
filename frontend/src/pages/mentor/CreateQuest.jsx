import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { questsAPI, coursesAPI } from '../../utils/api';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';

export default function CreateQuest() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  // Get course ID from URL parameters if available
  const courseParamId = searchParams.get('course');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: courseParamId || '', // Pre-fill if course ID is provided in URL
    passingScore: 70,
    timeLimit: 60,
    questions: []
  });

  // Fetch courses for the mentor
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setCoursesLoading(true);
        const response = await coursesAPI.getMyCourses();
        setCourses(response.data.data || []);

        // If a course ID was provided in URL but not in the form, set it
        if (courseParamId && !formData.course) {
          setFormData(prev => ({
            ...prev,
            course: courseParamId
          }));
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses');
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchCourses();
  }, [courseParamId, formData.course]);

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      question: '',
      type: 'multiple-choice',
      options: [{ text: '', isCorrect: false }],
      points: 1,
      explanation: ''
    };
    
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    setFormData(prev => {
      const newQuestions = [...prev.questions];
      newQuestions[index] = { ...newQuestions[index], [field]: value };
      return { ...prev, questions: newQuestions };
    });
  };

  const handleOptionChange = (questionIndex, optionIndex, field, value) => {
    setFormData(prev => {
      const newQuestions = [...prev.questions];
      const newOptions = [...newQuestions[questionIndex].options];
      newOptions[optionIndex] = { ...newOptions[optionIndex], [field]: value };
      newQuestions[questionIndex].options = newOptions;
      return { ...prev, questions: newQuestions };
    });
  };

  const handleAddOption = (questionIndex) => {
    setFormData(prev => {
      const newQuestions = [...prev.questions];
      newQuestions[questionIndex].options = [
        ...newQuestions[questionIndex].options,
        { text: '', isCorrect: false }
      ];
      return { ...prev, questions: newQuestions };
    });
  };

  const handleRemoveQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate there's at least one question
      if (formData.questions.length === 0) {
        throw new Error('Please add at least one question');
      }

      // Validate required fields
      if (!formData.title || !formData.description || !formData.course) {
        throw new Error('Please fill in all required fields');
      }

      const questData = {
        ...formData
      };

      await questsAPI.create(questData);
      setSuccess('Quest created successfully!');
      setTimeout(() => {
        // If a specific course was provided, go back to its content management
        if (courseParamId) {
          navigate(`/mentor/content/${courseParamId}`);
        } else {
          // Otherwise, go back to general mentor dashboard
          navigate('/mentor');
        }
      }, 2000);
    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Failed to create quest. Please try again.');
      console.error('Error creating quest:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Quest</h1>
      
      {loading && <Loading />}
      
      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}
      
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-6">
            <div>
              <Input
                label="Quest Title"
                name="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Enter quest title"
                required
              />
            </div>
            
            <div>
              <Textarea
                label="Description"
                name="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Enter quest description"
                required
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Passing Score (%)"
                  name="passingScore"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.passingScore}
                  onChange={(e) => handleChange('passingScore', parseInt(e.target.value) || 0)}
                  required
                />
              </div>
              
              <div>
                <Input
                  label="Time Limit (minutes, 0 for no limit)"
                  name="timeLimit"
                  type="number"
                  min="0"
                  value={formData.timeLimit}
                  onChange={(e) => handleChange('timeLimit', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Course
              </label>
              {coursesLoading ? (
                <div className="input">Loading courses...</div>
              ) : (
                <Select
                  name="course"
                  value={formData.course}
                  onChange={(e) => handleChange('course', e.target.value)}
                  options={[
                    { value: '', label: 'Select a course' },
                    ...courses.map(course => ({
                      value: course._id,
                      label: course.title
                    }))
                  ]}
                  required
                />
              )}
              <p className="mt-1 text-xs text-gray-500">Select the course this quest belongs to</p>
            </div>
            
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Questions</h3>
                <Button type="button" onClick={handleAddQuestion} variant="primary">
                  Add Question
                </Button>
              </div>
              
              {formData.questions.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No questions added yet. Click "Add Question" to get started.
                </div>
              ) : (
                <div className="space-y-6">
                  {formData.questions.map((question, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-gray-900">Question {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        <Textarea
                          label="Question Text"
                          value={question.question}
                          onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                          placeholder="Enter the question text"
                          required
                        />
                        
                        <Select
                          label="Question Type"
                          value={question.type}
                          onChange={(e) => handleQuestionChange(index, 'type', e.target.value)}
                          options={[
                            { value: 'multiple-choice', label: 'Multiple Choice' },
                            { value: 'true-false', label: 'True/False' },
                            { value: 'short-answer', label: 'Short Answer' }
                          ]}
                        />
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Options
                          </label>
                          <div className="space-y-2">
                            {question.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={option.text}
                                  onChange={(e) => handleOptionChange(index, optionIndex, 'text', e.target.value)}
                                  placeholder="Option text"
                                  className="input flex-1"
                                />
                                {question.type === 'multiple-choice' && (
                                  <label className="inline-flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={option.isCorrect}
                                      onChange={(e) => handleOptionChange(index, optionIndex, 'isCorrect', e.target.checked)}
                                      className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Correct</span>
                                  </label>
                                )}
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddOption(index)}
                            className="mt-2 text-sm text-primary-600 hover:text-primary-800"
                          >
                            + Add Option
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="Points"
                            type="number"
                            min="1"
                            value={question.points}
                            onChange={(e) => handleQuestionChange(index, 'points', parseInt(e.target.value) || 1)}
                          />
                          
                          <Textarea
                            label="Explanation (for correct answer)"
                            value={question.explanation}
                            onChange={(e) => handleQuestionChange(index, 'explanation', e.target.value)}
                            placeholder="Explanation for the correct answer"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                // If a specific course was provided, go back to its content management
                if (courseParamId) {
                  navigate(`/mentor/content/${courseParamId}`);
                } else {
                  // Otherwise, go back to general mentor dashboard
                  navigate('/mentor');
                }
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Quest'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}