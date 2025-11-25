import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { questsAPI, studentAPI } from '../../utils/api';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function Quest() {
  const { questId } = useParams();
  const navigate = useNavigate();

  const [quest, setQuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuest();
  }, [questId]);

  const fetchQuest = async () => {
    try {
      setLoading(true);
      const response = await questsAPI.getOne(questId);
      setQuest(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load quest');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => {
      const existing = prev.find((a) => a.questionId === questionId);
      if (existing) {
        return prev.map((a) => (a.questionId === questionId ? { ...a, answer } : a));
      }
      return [...prev, { questionId, answer }];
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await studentAPI.submitQuestAttempt(questId, { answers });
      setResult(response.data.data);
      if (response.data.data.passed) {
        toast.success('Congratulations! You passed!');
      } else {
        toast.error('You did not pass. Please try again later.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit quest');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading text="Loading quest..." />;
  if (error) return <Alert type="error" message={error} />;
  if (!quest) return <Alert type="info" message="Quest not found." />;

  if (result) {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Quest Results</h1>
            <p className={`text-lg font-semibold ${result.passed ? 'text-green-500' : 'text-red-500'}`}>
              You {result.passed ? 'Passed' : 'Failed'}
            </p>
            <p className="text-4xl font-bold my-4">{result.score}%</p>
            <p>Passing Score: {quest.passingScore}%</p>
            
            {result.passed && (
              <div className="my-6">
                <p>You have earned a certificate for this course!</p>
                <Button onClick={() => navigate('/student/certificates')} className="mt-4">
                  View My Certificates
                </Button>
              </div>
            )}
             <Button onClick={() => navigate('/student/courses')} className="mt-4" variant="secondary">
                Back to My Courses
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <Card>
        <h1 className="text-3xl font-bold mb-2">{quest.title}</h1>
        <p className="text-gray-600 mb-6">{quest.description}</p>

        <div className="space-y-8">
          {quest.questions.map((q, index) => (
            <div key={q._id}>
              <p className="font-semibold">{index + 1}. {q.text}</p>
              <div className="mt-4 space-y-2">
                {q.options.map((opt, i) => (
                  <label key={i} className="flex items-center p-2 border rounded-md">
                    <input
                      type="radio"
                      name={q._id}
                      value={opt.text}
                      onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                      className="mr-2"
                    />
                    {opt.text}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-right">
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Answers'}
          </Button>
        </div>
      </Card>
    </div>
  );
}