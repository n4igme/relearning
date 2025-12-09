import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { forumAPI } from '../../utils/api';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import { format } from 'date-fns';
import { ChatBubbleLeftRightIcon, UserIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function ForumThread() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [error, setError] = useState('');
  const [newReply, setNewReply] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    fetchThread();
  }, [id]);

  const fetchThread = async () => {
    try {
      setLoading(true);
      const response = await forumAPI.getQuestion(id);
      setThread(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to load forum thread. Please try again later.');
      console.error('Error fetching thread:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = async (e, parentId = null) => {
    e.preventDefault();
    setError('');
    
    if (!newReply.trim()) {
      setError('Reply cannot be empty');
      return;
    }

    try {
      setLoadingReplies(true);
      
      if (parentId) {
        // This would be for nested replies if the API supported it
        await forumAPI.addReply(id, newReply);
      } else {
        await forumAPI.addReply(id, newReply);
      }
      
      // Reset form and refresh thread
      setNewReply('');
      setReplyingTo(null);
      fetchThread();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add reply. Please try again.');
      console.error('Error adding reply:', err);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleAcceptReply = async (replyId) => {
    try {
      await forumAPI.acceptReply(id, replyId);
      // Refresh thread to show the accepted reply
      fetchThread();
    } catch (err) {
      setError('Failed to accept reply. Please try again.');
      console.error('Error accepting reply:', err);
    }
  };

  const handleVote = async (voteType, isReply = false, replyId = null) => {
    try {
      if (isReply) {
        await forumAPI.voteReply(id, replyId, voteType);
      } else {
        await forumAPI.voteQuestion(id, voteType);
      }
      // Refresh thread to show updated votes
      fetchThread();
    } catch (err) {
      setError('Failed to cast vote. Please try again.');
      console.error('Error voting:', err);
    }
  };

  if (loading) return <Loading />;
  
  if (error) return <Alert type="error" message={error} />;

  if (!thread) return <div>Thread not found</div>;

  const {
    title,
    content,
    author,
    course,
    replies = [],
    upvotes = [],
    downvotes = [],
    views = 0,
    isResolved = false,
    isPinned = false,
    createdAt
  } = thread;

  // Format date
  const formattedDate = format(new Date(createdAt), 'MMM d, yyyy \'at\' h:mm a');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button 
          onClick={() => navigate('/forum')} 
          className="btn btn-secondary mb-4"
        >
          ← Back to Forum
        </button>
      </div>

      {/* Original Post */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
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
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              </div>
              
              <div className="flex flex-wrap items-center text-sm text-gray-500 gap-4 mb-4">
                <div className="flex items-center">
                  <UserIcon className="h-4 w-4 mr-1" />
                  <span>{author?.name || 'Anonymous'}</span>
                </div>
                
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  <span>{formattedDate}</span>
                </div>
                
                <div className="text-sm text-gray-500">
                  Course: {course?.title || 'General'}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <button 
                onClick={() => handleVote('up')}
                className={`p-2 rounded-full ${upvotes.includes(localStorage.getItem('user_id')) ? 'text-green-600' : 'text-gray-400 hover:text-green-600'}`}
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <span className="text-sm font-medium">
                {upvotes.length - downvotes.length}
              </span>
              <button 
                onClick={() => handleVote('down')}
                className={`p-2 rounded-full ${downvotes.includes(localStorage.getItem('user_id')) ? 'text-red-600' : 'text-gray-400 hover:text-red-600'}`}
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="prose max-w-none text-gray-700">
            <p>{content}</p>
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-wrap items-center text-sm text-gray-500 gap-4">
            <div className="flex items-center">
              <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
              <span>{replies.length} replies</span>
            </div>
            
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              <span>{views} views</span>
            </div>
          </div>
        </div>
      </div>

      {/* Replies */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Replies ({replies.length})
        </h2>
        
        {replies.length > 0 ? (
          <div className="space-y-6">
            {replies.map((reply, index) => (
              <div key={reply._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-700 font-medium">
                        {reply.author?.name?.charAt(0).toUpperCase() || 'A'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">
                          {reply.author?.name || 'Anonymous'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {format(new Date(reply.createdAt), 'MMM d, yyyy \'at\' h:mm a')}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {reply.isAccepted && (
                          <span className="inline-flex items-center text-green-600 text-sm">
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Accepted
                          </span>
                        )}
                        
                        {!reply.isAccepted && (
                          <button 
                            onClick={() => handleAcceptReply(reply._id)}
                            className="text-sm text-green-600 hover:text-green-800"
                          >
                            Accept Answer
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-3 text-gray-700">
                      <p>{reply.content}</p>
                    </div>
                    
                    <div className="mt-4 flex items-center">
                      <button 
                        onClick={() => handleVote('up', true, reply._id)}
                        className={`p-1 rounded ${reply.upvotes?.includes(localStorage.getItem('user_id')) ? 'text-green-600' : 'text-gray-400 hover:text-green-600'}`}
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <span className="mx-1 text-sm">
                        {reply.upvotes?.length || 0}
                      </span>
                      <button 
                        onClick={() => handleVote('down', true, reply._id)}
                        className={`p-1 rounded ${reply.downvotes?.includes(localStorage.getItem('user_id')) ? 'text-red-600' : 'text-gray-400 hover:text-red-600'}`}
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      <button 
                        onClick={() => {
                          setReplyingTo(reply._id);
                          setNewReply(`@${reply.author?.name || 'user'} `);
                        }}
                        className="ml-4 text-sm text-gray-600 hover:text-gray-900"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No replies yet. Be the first to answer this question.</p>
          </div>
        )}
      </div>

      {/* Reply Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {replyingTo ? 'Reply to Thread' : 'Post a Reply'}
        </h3>
        
        {error && <Alert type="error" message={error} />}
        
        <form onSubmit={handleReplySubmit}>
          <div className="mb-4">
            <textarea
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="Write your reply here..."
              className="input w-full h-32"
              required
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loadingReplies}
              className="btn btn-primary"
            >
              {loadingReplies ? 'Posting...' : 'Post Reply'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}