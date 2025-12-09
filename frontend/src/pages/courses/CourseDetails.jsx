import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { coursesAPI, studentAPI } from '../../utils/api';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import LessonCard from '../../components/common/LessonCard';
import QuestCard from '../../components/common/QuestCard';
import { StarIcon, UserIcon, ClockIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [userEnrollment, setUserEnrollment] = useState(null);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getOne(id);
      setCourse(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to load course. Please try again later.');
      console.error('Error fetching course:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      await studentAPI.enroll(id);
      // Refresh course data after enrollment
      fetchCourse();
      // Navigate to course materials or show success message
      navigate(`/courses/${id}/materials`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to enroll in course. Please try again.');
      console.error('Error enrolling in course:', err);
    }
  };

  if (loading) return <Loading />;
  
  if (error) return <Alert type="error" message={error} />;

  if (!course) return <div>Course not found</div>;

  const { 
    title, 
    description, 
    creator, 
    materials = [],
    quests = [],
    price,
    difficulty,
    rating,
    enrollmentCount,
    isPublished,
    approvalStatus
  } = course;

  // Check if user is enrolled
  const isEnrolled = course.enrolledCourses && course.enrolledCourses.length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Course Header */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
              <p className="text-gray-600 mb-4">{description}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <UserIcon className="h-4 w-4 mr-1" />
                  <span>Instructor: {creator?.name || 'Unknown'}</span>
                </div>
                
                <div className="flex items-center">
                  <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                  <span>
                    {rating?.average?.toFixed(1) || '0.0'} ({rating?.count || 0} reviews)
                  </span>
                </div>
                
                <div className="flex items-center">
                  <UserIcon className="h-4 w-4 mr-1" />
                  <span>{enrollmentCount || 0} students</span>
                </div>
                
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                  difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {difficulty}
                </div>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 text-right">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {price?.amount > 0 ? `$${price.amount}` : 'Free'}
              </div>
              {isEnrolled ? (
                <Link
                  to={`/courses/${id}/materials`}
                  className="btn btn-primary"
                >
                  Continue Learning
                </Link>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={!isPublished || approvalStatus !== 'approved'}
                  className="btn btn-primary w-full md:w-auto"
                >
                  {!isPublished || approvalStatus !== 'approved' 
                    ? 'Course Not Available' 
                    : 'Enroll Now'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Course Tabs */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'curriculum'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Curriculum
            </button>
            <button
              onClick={() => setActiveTab('quests')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'quests'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Quests
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Course Description</h3>
              <div className="prose max-w-none text-gray-600">
                <p>{description}</p>
              </div>
              
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">What you'll learn</h4>
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  <li>Master the fundamentals of the subject</li>
                  <li>Build practical, real-world projects</li>
                  <li>Apply knowledge through hands-on exercises</li>
                  <li>Prepare for advanced topics in the field</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'curriculum' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Course Content</h3>
              
              {materials && materials.length > 0 ? (
                <div className="space-y-4">
                  {materials.map((material, index) => (
                    <div key={material._id} className="border-l-4 border-primary-500 pl-4 py-2">
                      <h4 className="font-medium text-gray-900">{material.title}</h4>
                      {material.description && (
                        <p className="text-sm text-gray-600 mb-3">{material.description}</p>
                      )}
                      
                      <div className="ml-4 space-y-2">
                        {material.subMaterials && material.subMaterials
                          .sort((a, b) => a.order - b.order)
                          .map((subMaterial) => (
                            <LessonCard
                              key={subMaterial._id}
                              lesson={{
                                ...subMaterial,
                                type: subMaterial.type,
                                duration: subMaterial.duration,
                                title: subMaterial.title,
                                content: subMaterial.content,
                                url: subMaterial.url
                              }}
                              courseId={id}
                              isCompleted={false} // This would come from user progress
                            />
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No course content available yet.</p>
              )}
            </div>
          )}

          {activeTab === 'quests' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Course Quests</h3>
              
              {quests && quests.length > 0 ? (
                <div className="space-y-4">
                  {quests.map(quest => (
                    <QuestCard
                      key={quest._id}
                      quest={quest}
                      courseId={id}
                      userSubmission={null} // This would come from user submissions
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No quests assigned to this course yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}