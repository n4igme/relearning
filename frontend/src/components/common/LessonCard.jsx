import { Link } from 'react-router-dom';
import { 
  VideoCameraIcon, 
  DocumentTextIcon, 
  LinkIcon,
  CheckCircleIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function LessonCard({ 
  lesson, 
  courseId, 
  isCompleted = false, 
  onMarkComplete,
  currentLesson = false
}) {
  const { 
    _id,
    title, 
    type, 
    duration, 
    order,
    content,
    url
  } = lesson;

  // Icon mapping based on content type
  const getIcon = () => {
    switch(type) {
      case 'video':
        return <VideoCameraIcon className="h-5 w-5 text-red-500" />;
      case 'article':
        return <DocumentTextIcon className="h-5 w-5 text-blue-500" />;
      case 'resource':
        return <LinkIcon className="h-5 w-5 text-green-500" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  // Get duration in minutes
  const durationText = duration ? `${duration} min` : '';

  return (
    <div className={`border rounded-lg p-4 mb-3 transition-colors ${
      currentLesson 
        ? 'border-primary-500 bg-primary-50' 
        : isCompleted
        ? 'border-green-200 bg-green-50'
        : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-1">
          {getIcon()}
          {isCompleted && (
            <CheckCircleIcon className="h-5 w-5 text-green-500 mt-1" />
          )}
        </div>
        
        <div className="ml-3 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-gray-900">{title}</h4>
              <div className="flex items-center mt-1">
                {durationText && (
                  <div className="flex items-center text-sm text-gray-500">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {durationText}
                  </div>
                )}
              </div>
            </div>
            
            {onMarkComplete && !isCompleted && (
              <button
                onClick={() => onMarkComplete(_id)}
                className="btn btn-secondary btn-sm"
              >
                {currentLesson ? 'Continue' : 'Start'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {content && (
        <div className="mt-3 text-sm text-gray-600 line-clamp-2">
          {content}
        </div>
      )}
    </div>
  );
}