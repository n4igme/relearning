import { Link } from 'react-router-dom';
import { StarIcon, UserIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import ProgressBar from './ProgressBar';

export default function CourseCard({ course, userProgress }) {
  const {
    _id,
    title,
    description,
    difficulty,
    creator,
    thumbnail,
    price,
    rating,
    enrollmentCount,
    isPublished,
    approvalStatus
  } = course;

  // Format difficulty for badge
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800'
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {thumbnail ? (
        <img 
          src={thumbnail} 
          alt={title} 
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="bg-gray-200 w-full h-48 flex items-center justify-center">
          <span className="text-gray-500">No image</span>
        </div>
      )}
      
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{title}</h3>
          {price?.amount > 0 ? (
            <span className="text-lg font-bold text-primary-600">
              ${price.amount}
            </span>
          ) : (
            <span className="text-lg font-bold text-green-600">Free</span>
          )}
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[difficulty] || 'bg-gray-100 text-gray-800'}`}>
            {difficulty}
          </span>
          
          {rating && (
            <div className="flex items-center">
              <StarIcon className="h-4 w-4 text-yellow-400" />
              <span className="text-xs text-gray-600 ml-1">{rating.average?.toFixed(1)} ({rating.count})</span>
            </div>
          )}
          
          <div className="flex items-center">
            <UserIcon className="h-4 w-4 text-gray-500" />
            <span className="text-xs text-gray-600 ml-1">{enrollmentCount || 0}</span>
          </div>
        </div>
        
        {userProgress && userProgress.progress > 0 && (
          <div className="mb-4">
            <ProgressBar 
              value={userProgress.progress} 
              label="Your Progress" 
              showPercentage={true} 
            />
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            By {creator?.name || 'Unknown'}
          </div>
          
          <Link
            to={`/courses/${_id}`}
            className="btn btn-primary btn-sm"
          >
            View Course
          </Link>
        </div>
      </div>
    </div>
  );
}