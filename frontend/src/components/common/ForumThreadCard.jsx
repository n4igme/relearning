import { Link } from 'react-router-dom';
import { 
  ChatBubbleLeftRightIcon, 
  UserIcon, 
  EyeIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export default function ForumThreadCard({ thread }) {
  const {
    _id,
    title,
    content,
    author,
    course,
    replies = [],
    views = 0,
    isResolved = false,
    isPinned = false,
    createdAt
  } = thread;

  // Format date
  const formattedDate = format(new Date(createdAt), 'MMM d, yyyy');

  return (
    <div className={`border rounded-lg p-5 mb-4 transition-colors ${
      isPinned 
        ? 'border-yellow-200 bg-yellow-50' 
        : isResolved
        ? 'border-green-200 bg-green-50'
        : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            {isPinned && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded mr-2">
                Pinned
              </span>
            )}
            {isResolved && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded mr-2">
                Resolved
              </span>
            )}
            <h3 className="font-bold text-lg text-gray-900">{title}</h3>
          </div>
          
          <p className="text-gray-600 mb-3 line-clamp-2">{content}</p>
          
          <div className="flex flex-wrap items-center text-sm text-gray-500 gap-4">
            <div className="flex items-center">
              <UserIcon className="h-4 w-4 mr-1" />
              <span>{author?.name || 'Anonymous'}</span>
            </div>
            
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              <span>{formattedDate}</span>
            </div>
            
            <div className="flex items-center">
              <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
              <span>{replies.length} replies</span>
            </div>
            
            <div className="flex items-center">
              <EyeIcon className="h-4 w-4 mr-1" />
              <span>{views} views</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Course: {course?.title || 'N/A'}
        </div>
        
        <Link
          to={`/forum/${_id}`}
          className="btn btn-secondary"
        >
          View Thread
        </Link>
      </div>
    </div>
  );
}