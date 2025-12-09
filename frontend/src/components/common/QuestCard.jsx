import { Link } from 'react-router-dom';
import { 
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

export default function QuestCard({ 
  quest, 
  courseId,
  userSubmission 
}) {
  const {
    _id,
    title,
    description,
    timeLimit,
    passingScore,
    attempts
  } = quest;

  // Check if user has submitted this quest
  const hasSubmitted = userSubmission && userSubmission.status === 'completed';
  const submittedAttempt = attempts && attempts.find(attempt => 
    attempt.student && attempt.student.toString() === localStorage.getItem('user')?._id
  );
  
  // Format time limit
  const timeLimitText = timeLimit ? `${timeLimit} minutes` : 'No time limit';

  return (
    <div className={`border rounded-lg p-4 mb-4 transition-colors ${
      hasSubmitted 
        ? 'border-green-200 bg-green-50' 
        : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
        
        {hasSubmitted ? (
          <CheckCircleIcon className="h-6 w-6 text-green-500" />
        ) : (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
            Pending
          </span>
        )}
      </div>
      
      <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
        <div className="flex items-center">
          <ClockIcon className="h-4 w-4 mr-1" />
          <span>{timeLimitText}</span>
        </div>
        
        <div className="flex items-center">
          <span className="font-medium">Passing: </span>
          <span className="ml-1">{passingScore}%</span>
        </div>
        
        {submittedAttempt && submittedAttempt.score && (
          <div className="flex items-center">
            <span className="font-medium">Score: </span>
            <span className="ml-1">{submittedAttempt.score}%</span>
          </div>
        )}
      </div>
      
      <div className="mt-4">
        {hasSubmitted ? (
          <Link
            to={`/quest/${_id}`}
            className="btn btn-secondary"
          >
            View Result
          </Link>
        ) : (
          <Link
            to={`/quest/${_id}`}
            className="btn btn-primary"
          >
            Take Quest
          </Link>
        )}
      </div>
    </div>
  );
}