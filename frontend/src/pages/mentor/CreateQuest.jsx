import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { questsAPI, coursesAPI } from '../../utils/api';
import { toast } from 'react-hot-toast';

// Icons
import { 
  DocumentTextIcon, 
  ArrowLeftIcon, 
  PlusIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

function CreateQuest() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courseError, setCourseError] = useState('');

  // Fetch mentor's courses when the component mounts
  useState(() => {
    const fetchCourses = async () => {
      try {
        const response = await coursesAPI.getMyCourses();
        setCourses(response.data.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error('Failed to load courses');
      }
    };

    fetchCourses();
  }, []);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    passingScore: 70,
    questions: [
      {
        question: '',
        type: 'multiple-choice',
        options: [{ text: '', isCorrect: false }],
        points: 1
      }
    ]
  });

  const questionTypes = [
    { value: 'multiple-choice', label: 'Multiple Choice' },
    { value: 'true-false', label: 'True/False' },
    { value: 'short-answer', label: 'Short Answer' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    setFormData(prev => ({
      ...prev,
      courseId
    }));
    setSelectedCourse(courseId);
    if (!courseId) {
      setCourseError('Please select a course');
    } else {
      setCourseError('');
    }
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question: '',
          type: 'multiple-choice',
          options: [{ text: '', isCorrect: false }],
          points: 1
        }
      ]
    }));
  };

  const removeQuestion = (index) => {
    if (formData.questions.length <= 1) return;
    const newQuestions = [...formData.questions];
    newQuestions.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      questions: newQuestions
    }));
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      questions: newQuestions
    }));
  };

  const addOption = (questionIndex) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options = [
      ...newQuestions[questionIndex].options,
      { text: '', isCorrect: false }
    ];
    setFormData(prev => ({
      ...prev,
      questions: newQuestions
    }));
  };

  const removeOption = (questionIndex, optionIndex) => {
    if (formData.questions[questionIndex].options.length <= 1) return;
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options = [
      ...newQuestions[questionIndex].options.slice(0, optionIndex),
      ...newQuestions[questionIndex].options.slice(optionIndex + 1)
    ];
    setFormData(prev => ({
      ...prev,
      questions: newQuestions
    }));
  };

  const updateOption = (questionIndex, optionIndex, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options[optionIndex] = {
      ...newQuestions[questionIndex].options[optionIndex],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      questions: newQuestions
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate course selection
    if (!formData.courseId) {
      setCourseError('Please select a course');
      setLoading(false);
      return;
    }

    try {
      // Process questions to ensure correct options are marked
      const processedQuestions = formData.questions.map(q => {
        if (q.type === 'multiple-choice') {
          // For multiple choice, ensure at least one option is correct
          const hasCorrectOption = q.options.some(opt => opt.isCorrect);
          if (!hasCorrectOption && q.options.length > 0) {
            // Mark the first option as correct if none are marked
            const updatedOptions = q.options.map((opt, idx) => 
              idx === 0 ? { ...opt, isCorrect: true } : opt
            );
            return { ...q, options: updatedOptions };
          }
        }
        return q;
      });

      const questData = {
        ...formData,
        courseId: formData.courseId,
        questions: processedQuestions
      };

      const response = await questsAPI.create(questData);
      
      if (response.data.success) {
        toast.success('Assessment created successfully!');
        navigate('/mentor/content');
      }
    } catch (error) {
      console.error('Error creating assessment:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create assessment';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/mentor/content');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <button
          onClick={handleBack}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to My Content
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Assessment</h3>
          <p className="mt-1 text-sm text-gray-500">
            Create an assessment for one of your courses
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Assessment Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Assessment Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter assessment title"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Describe the assessment"
              />
            </div>

            {/* Course Selection */}
            <div>
              <label htmlFor="courseId" className="block text-sm font-medium text-gray-700">
                Course
              </label>
              <select
                id="courseId"
                name="courseId"
                value={formData.courseId}
                onChange={handleCourseChange}
                required
                className={`mt-1 block w-full bg-white border ${courseError ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              >
                <option value="">Select a course</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
              {courseError && (
                <p className="mt-1 text-sm text-red-600">{courseError}</p>
              )}
            </div>

            {/* Passing Score */}
            <div>
              <label htmlFor="passingScore" className="block text-sm font-medium text-gray-700">
                Passing Score (%)
              </label>
              <input
                type="number"
                id="passingScore"
                name="passingScore"
                min="0"
                max="100"
                value={formData.passingScore}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="70"
              />
            </div>

            {/* Questions Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Questions</h3>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Question
                </button>
              </div>

              {formData.questions.map((question, qIndex) => (
                <div key={qIndex} className="mb-6 p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-medium text-gray-900">Question {qIndex + 1}</h4>
                    {formData.questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <XCircleIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  {/* Question Text */}
                  <div className="mb-4">
                    <label htmlFor={`question-${qIndex}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Question
                    </label>
                    <input
                      type="text"
                      id={`question-${qIndex}`}
                      value={question.question}
                      onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter question text"
                    />
                  </div>

                  {/* Question Type */}
                  <div className="mb-4">
                    <label htmlFor={`type-${qIndex}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      id={`type-${qIndex}`}
                      value={question.type}
                      onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                      className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      {questionTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Points */}
                  <div className="mb-4">
                    <label htmlFor={`points-${qIndex}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Points
                    </label>
                    <input
                      type="number"
                      id={`points-${qIndex}`}
                      min="1"
                      value={question.points}
                      onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value))}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="1"
                    />
                  </div>

                  {/* Options for Multiple Choice and True/False */}
                  {(question.type === 'multiple-choice') && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Options
                        </label>
                        <button
                          type="button"
                          onClick={() => addOption(qIndex)}
                          className="text-sm text-blue-600 hover:text-blue-900"
                        >
                          + Add Option
                        </button>
                      </div>
                      
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-start mb-2">
                          <input
                            type="checkbox"
                            id={`option-correct-${qIndex}-${oIndex}`}
                            checked={option.isCorrect}
                            onChange={(e) => updateOption(qIndex, oIndex, 'isCorrect', e.target.checked)}
                            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) => updateOption(qIndex, oIndex, 'text', e.target.value)}
                            required
                            className="ml-2 flex-1 min-w-0 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Option text"
                          />
                          {question.options.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeOption(qIndex, oIndex)}
                              className="ml-2 text-red-600 hover:text-red-900"
                            >
                              <XCircleIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {question.type === 'true-false' && (
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id={`tf-option-${qIndex}-true`}
                          name={`tf-option-${qIndex}`}
                          checked={question.options[0]?.text === 'True' && question.options[0]?.isCorrect}
                          onChange={() => {
                            const updatedOptions = [
                              { text: 'True', isCorrect: true },
                              { text: 'False', isCorrect: false }
                            ];
                            updateQuestion(qIndex, 'options', updatedOptions);
                          }}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <label htmlFor={`tf-option-${qIndex}-true`} className="ml-2 block text-sm text-gray-700">
                          True
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id={`tf-option-${qIndex}-false`}
                          name={`tf-option-${qIndex}`}
                          checked={question.options[0]?.text === 'False' && question.options[0]?.isCorrect}
                          onChange={() => {
                            const updatedOptions = [
                              { text: 'True', isCorrect: false },
                              { text: 'False', isCorrect: true }
                            ];
                            updateQuestion(qIndex, 'options', updatedOptions);
                          }}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <label htmlFor={`tf-option-${qIndex}-false`} className="ml-2 block text-sm text-gray-700">
                          False
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleBack}
                className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create Assessment
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateQuest;