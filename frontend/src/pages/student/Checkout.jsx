import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { coursesAPI, paymentsAPI, studentAPI } from '../../utils/api';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';

export default function CheckoutPage() {
  const { id } = useParams(); // course ID
  const navigate = useNavigate();
  const location = useLocation();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Get course data either from parameter or fetch from API
  useEffect(() => {
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

    if (id) {
      fetchCourse();
    }
  }, [id]);

  // Use course from location state if available (when navigated directly from course)
  useEffect(() => {
    if (location.state?.course) {
      setCourse(location.state.course);
      setLoading(false);
    }
  }, [location.state]);

  const handlePayment = async () => {
    if (!course) return;
    
    try {
      setIsProcessing(true);
      // Create payment intent
      const response = await paymentsAPI.createIntent(course._id);
      const { clientSecret } = response.data;

      // In a real implementation, you would integrate with Stripe here
      // For now, we'll simulate the payment process
      console.log('Payment intent created:', clientSecret);
      
      // Enroll the student (which creates payment record and enrolls in one step)
      const enrollmentResponse = await studentAPI.enroll(course._id);
      
      if (enrollmentResponse.data.success) {
        alert('Payment processed and enrollment completed successfully!');
        navigate('/student/courses'); // Redirect to enrolled courses
      } else {
        setError(enrollmentResponse.data.message || 'Enrollment failed after payment');
      }
      setIsProcessing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
      setIsProcessing(false);
    }
  };

  if (loading) {
    return <Loading text="Loading checkout information..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Alert type="error" message={error} />
          <div className="mt-4 text-center">
            <button 
              onClick={() => navigate(-1)} 
              className="btn btn-outline"
            >
              Go Back
            </button>
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
              <div className="text-6xl mb-4">❌</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Course not found</h3>
              <p className="text-gray-600">
                The course you're trying to enroll in doesn't exist or may have been removed
              </p>
              <div className="mt-4">
                <button 
                  onClick={() => navigate('/courses')} 
                  className="btn btn-primary"
                >
                  Browse All Courses
                </button>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Checkout</h1>
        
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600">
          <button onClick={() => navigate('/')} className="hover:underline">Home</button>
          <span className="mx-2">/</span>
          <button onClick={() => navigate('/courses')} className="hover:underline">Courses</button>
          <span className="mx-2">/</span>
          <button onClick={() => navigate(`/courses/${course._id}`)} className="hover:underline">{course.title}</button>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Checkout</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Information */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Course Information</h2>
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48 flex items-center justify-center">
                    <span className="text-gray-500">Course Image</span>
                  </div>
                </div>
                
                <div className="md:w-2/3 space-y-2">
                  <h3 className="text-lg font-semibold">{course.title}</h3>
                  <p className="text-gray-600">{course.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {course.category}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                      {course.difficulty}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {course.enrollmentCount} students
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Order Summary */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Course Fee</span>
                  <span>${course.price?.amount?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>$0.00</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between font-bold">
                  <span>Total</span>
                  <span>${course.price?.amount?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Payment Section */}
          <div>
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="input w-full"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVC
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      className="input w-full"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="input w-full"
                  />
                </div>
                
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className={`btn btn-primary w-full ${
                    isProcessing ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isProcessing ? 'Processing...' : `Pay $${course.price?.amount?.toFixed(2) || '0.00'}`}
                </button>
                
                <div className="text-xs text-gray-500 mt-4">
                  <p>Your payment information is secure and encrypted through our payment partner.</p>
                </div>
              </div>
            </Card>
            
            <Card className="mt-4">
              <h3 className="font-semibold text-gray-900 mb-2">Secure Payment</h3>
              <p className="text-sm text-gray-600">
                All payment information is securely processed. Your credit card details are encrypted and never stored on our servers.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}