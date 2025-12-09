import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { questsAPI, studentAPI } from '../../utils/api';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import { ClockIcon } from '@heroicons/react/24/outline';

export default function Quest() {
  const { questId } = useParams();
  const navigate = useNavigate();
  const [quest, setQuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    fetchQuest();
  }, [questId]);

  useEffect(() => {
    // Set up timer if time limit is specified
    if (quest && quest.timeLimit > 0) {
      setTimeLeft(quest.timeLimit * 60); // Convert minutes to seconds
    }
  }, [quest]);

  useEffect(() => {
    // Handle timer countdown
    let timer;
    if (timeLeft !== null && timeLeft > 0 && !showResults) {
      timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Time's up, submit automatically
      handleSubmitAttempt();
    }
    
    return () => clearTimeout(timer);
  }, [timeLeft, showResults]);

  const fetchQuest = async () => {
    try {
      setLoading(true);
      const response = await questsAPI.getOne(questId);
      setQuest(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to load quest. Please try again later.');
      console.error('Error fetching quest:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < (quest.questions?.length - 1)) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmitAttempt = async () => {
    setError('');
    setSubmitting(true);

    try {
      // Prepare submission data
      const submissionData = {
        answers: quest.questions.map((question, index) => ({
          questionId: question._id,
          answer: answers[index]
        }))
      };

      const response = await studentAPI.submitQuestAttempt(questId, submissionData);
      
      // Show results
      setShowResults(true);
      
      // Navigate to course completion if passed
      if (response.data.data.passed) {
        // For now, just show the result. In a real app, we might want to navigate to course completion
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit quest. Please try again.');
      console.error('Error submitting quest:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;
  
  if (error) return <Alert type="error" message={error} />;

  if (!quest) return <div>Quest not found</div>;

  const { title, description, questions, timeLimit, passingScore } = quest;
  const totalQuestions = questions?.length || 0;

  // Format time left as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (showResults) {
    // This is a simplified view - in a real app, you'd want to show detailed results
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Quest Results</h1>
          
          <div className="text-center py-8">
            <div className="text-5xl font-bold text-green-600 mb-4">
              {answers.score || 'N/A'}%
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {answers.score >= passingScore ? 'Passed!' : 'Needs Improvement'}
            </h2>
            <p className="text-gray-600 mb-6">
              {answers.score >= passingScore 
                ? 'Congratulations! You have completed this quest.' 
                : `You need ${passingScore}% to pass. Keep practicing!`}
            </p>
            
            <div className="space-x-4">
              <button 
                onClick={() => navigate(`/courses/${quest.course?._id}`)}
                className="btn btn-secondary"
              >
                Back to Course
              </button>
              
              {answers.score < passingScore && (
                <button 
                  onClick={() => {
                    setShowResults(false);
                    setAnswers({});
                  }}
                  className="btn btn-primary"
                >
                  Retry Quest
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Quest Header */}
          <div className="bg-primary-600 text-white p-6">
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="mt-2 opacity-90">{description}</p>
            
            {timeLimit > 0 && (
              <div className="mt-4 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2" />
                <span className="text-lg font-medium">Time Left: {formatTime(timeLeft)}</span>
              </div>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="p-4 border-b">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Question {currentQuestion + 1} of {totalQuestions}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {Math.round(((currentQuestion + 1) / totalQuestions) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {/* Question Content */}
          <div className="p-6">
            {questions && questions.length > 0 && currentQuestion < questions.length ? (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {questions[currentQuestion].question}
                </h2>
                
                {/* Options based on question type */}
                {questions[currentQuestion].type === 'multiple-choice' && (
                  <div className="space-y-3">
                    {questions[currentQuestion].options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-start">
                        <input
                          type="radio"
                          id={`option-${optionIndex}`}
                          name={`question-${currentQuestion}`}
                          checked={answers[currentQuestion] === optionIndex}
                          onChange={() => handleAnswerChange(currentQuestion, optionIndex)}
                          className="mt-1"
                        />
                        <label 
                          htmlFor={`option-${optionIndex}`} 
                          className="ml-3 block text-gray-700"
                        >
                          {option.text}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
                
                {questions[currentQuestion].type === 'true-false' && (
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="true"
                        name={`question-${currentQuestion}`}
                        checked={answers[currentQuestion] === true}
                        onChange={() => handleAnswerChange(currentQuestion, true)}
                      />
                      <label htmlFor="true" className="ml-3 block text-gray-700">True</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="false"
                        name={`question-${currentQuestion}`}
                        checked={answers[currentQuestion] === false}
                        onChange={() => handleAnswerChange(currentQuestion, false)}
                      />
                      <label htmlFor="false" className="ml-3 block text-gray-700">False</label>
                    </div>
                  </div>
                )}
                
                {questions[currentQuestion].type === 'short-answer' && (
                  <textarea
                    value={answers[currentQuestion] || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
                    className="input w-full"
                    rows="4"
                    placeholder="Enter your answer..."
                  />
                )}
                
                {/* Question Navigation */}
                <div className="mt-8 flex justify-between">
                  <button
                    onClick={handlePrevQuestion}
                    disabled={currentQuestion === 0}
                    className="btn btn-secondary"
                  >
                    Previous
                  </button>
                  
                  {currentQuestion < totalQuestions - 1 ? (
                    <button
                      onClick={handleNextQuestion}
                      disabled={!answers[currentQuestion]}
                      className={`btn ${
                        answers[currentQuestion] ? 'btn-primary' : 'btn-secondary'
                      }`}
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitAttempt}
                      disabled={submitting || !answers[currentQuestion]}
                      className={`btn ${
                        answers[currentQuestion] ? 'btn-primary' : 'btn-secondary'
                      }`}
                    >
                      {submitting ? 'Submitting...' : 'Submit Quest'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No questions available for this quest.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}