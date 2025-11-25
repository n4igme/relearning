import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { coursesAPI } from '../../utils/api';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Badge from '../../components/common/Badge';

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getOne(id);
      setCourse(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = () => {
    // Navigate to the checkout page to complete enrollment
    navigate(`/checkout/${id}`);
  };

  if (loading) {
    return <Loading text="Loading course details..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Alert type="error" message={error} />
          <div className="mt-4 text-center">
            <Link to="/courses" className="btn btn-primary">
              Browse All Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Course not found</h3>
              <p className="text-gray-600">
                The course you're looking for doesn't exist or may have been removed
              </p>
              <div className="mt-4">
                <Link to="/courses" className="btn btn-primary">
                  Browse All Courses
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link to="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/courses" className="hover:underline">Courses</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{course.title}</span>
        </nav>

        {/* Course Header */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Image Section (placeholder) */}
            <div className="md:w-2/5">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64 flex items-center justify-center">
                <span className="text-gray-500">Course Thumbnail</span>
              </div>
            </div>

            {/* Course Info Section */}
            <div className="md:w-3/5 space-y-4">
              <div>
                <div className="flex items-start justify-between">
                  <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
                  <div className="text-right">
                    {course.price?.amount > 0 ? (
                      <div className="text-2xl font-bold text-gray-900">
                        ${course.price.amount.toFixed(2)}
                      </div>
                    ) : (
                      <Badge variant="success" size="lg">Free</Badge>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 mt-2">{course.description}</p>
              </div>

              {/* Course Meta */}
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center">
                  <span className="mr-2 text-gray-600">Category:</span>
                  <Badge variant="primary">{course.category}</Badge>
                </div>
                <div className="flex items-center">
                  <span className="mr-2 text-gray-600">Level:</span>
                  <Badge variant="default">{course.difficulty}</Badge>
                </div>
                <div className="flex items-center">
                  <span className="mr-2 text-gray-600">Students:</span>
                  <span className="font-medium">{course.enrollmentCount || 0}</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2 text-gray-600">Rating:</span>
                  <span className="font-medium">
                    {course.rating?.average > 0 ? course.rating.average.toFixed(1) : 'New'}
                    <span className="ml-1">⭐</span>
                  </span>
                </div>
              </div>

              {/* Tags */}
              {course.tags && course.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {course.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={handleEnroll}
                  disabled={!course.isPublished}
                  className={`btn ${
                    course.isPublished ? 'btn-primary' : 'btn-secondary'
                  } ${!course.isPublished ? 'cursor-not-allowed' : ''}`}
                >
                  {course.isPublished ? 'Enroll Now' : 'Coming Soon'}
                </button>
                <Link to="/courses" className="btn btn-outline">
                  Back to Courses
                </Link>
              </div>

              {/* Creator Info */}
              <div className="flex items-center pt-4 border-t border-gray-200">
                <div className="mr-3">
                  <div className="bg-gray-200 border-2 border-dashed rounded-full w-12 h-12" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Created by {course.creator?.name || 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {course.creator?.role?.charAt(0).toUpperCase() + course.creator?.role?.slice(1) || 'Instructor'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Course Content */}
        {course.content && course.content.length > 0 && (
          <Card className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Course Content</h2>
            <div className="space-y-3">
              {course.content.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="mr-3 text-gray-500">
                    {item.type === 'video' && '🎬'}
                    {item.type === 'article' && '📄'}
                    {item.type === 'quiz' && '❓'}
                    {item.type === 'resource' && '🔗'}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.title}</div>
                    <div className="text-sm text-gray-600">
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)} • 
                      {item.duration ? ` ${item.duration} min` : ' Duration unknown'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Course Details */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">About This Course</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What you'll learn</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Learn fundamental concepts of {course.category || 'this subject'}</li>
                <li>Build practical skills through hands-on projects</li>
                <li>Prepare for real-world challenges</li>
                <li>Get feedback from experienced mentors</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Requirements</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Basic understanding of programming concepts</li>
                <li>A computer with internet access</li>
                <li>Willingness to learn and practice</li>
                <li>No prior experience with {course.title.toLowerCase()} required</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-2">Course Description</h3>
            <p className="text-gray-700">
              {course.description || 'This course covers comprehensive material to help you master the subject. You will learn through a combination of video lectures, practical exercises, and assessments.'}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}