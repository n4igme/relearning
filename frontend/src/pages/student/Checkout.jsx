import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { enrollmentsAPI } from '../../utils/api';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';

export default function Checkout() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe');

  useEffect(() => {
    // In a real app, we would fetch course details by ID
    // For now, we'll simulate
    setCourse({
      _id: courseId,
      title: 'Sample Course',
      description: 'This is a sample course description',
      price: { 
        amount: 299.99,
        currency: 'USD'
      },
      creator: { name: 'John Doe' },
      thumbnail: 'https://via.placeholder.com/400x200',
    });
    setLoading(false);
  }, [courseId]);

  const handleEnroll = async () => {
    try {
      setProcessing(true);
      setError('');
      
      // Create enrollment
      const enrollmentResponse = await enrollmentsAPI.create({
        courseId
      });

      if (enrollmentResponse.data.success) {
        // Create payment intent
        const paymentResponse = await enrollmentsAPI.initiatePayment(enrollmentResponse.data.data._id);
        
        if (paymentResponse.data.success) {
          setPaymentIntent(paymentResponse.data.data);
          
          // For Stripe, we would redirect to Stripe checkout
          // For now, just mock the redirect
          if (paymentMethod === 'stripe') {
            // In a real app we would redirect to Stripe checkout
            alert('Redirecting to payment gateway...');
          } else {
            // For midtrans or other methods
            alert('Redirecting to payment gateway...');
          }
        } else {
          setError('Failed to create payment intent');
        }
      } else {
        setError('Failed to enroll in course');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process enrollment');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:gap-8">
        {/* Order Summary */}
        <div className="md:w-1/2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
            
            <div className="flex items-center mb-6">
              <img 
                src={course.thumbnail} 
                alt={course.title} 
                className="w-16 h-16 object-cover rounded-md"
              />
              <div className="ml-4">
                <h3 className="font-medium text-gray-900">{course.title}</h3>
                <p className="text-sm text-gray-500">Instructor: {course.creator.name}</p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between text-base font-medium text-gray-900 mb-1">
                <p>Subtotal</p>
                <p>${course.price.amount.toFixed(2)}</p>
              </div>
              <div className="flex justify-between text-base font-medium text-gray-900 mb-1">
                <p>Platform Fee</p>
                <p>${(course.price.amount * 0.1).toFixed(2)}</p>
              </div>
              <div className="flex justify-between text-base font-medium text-gray-900 mt-4">
                <p>Total</p>
                <p>${(course.price.amount * 1.1).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="md:w-1/2 mt-8 md:mt-0">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h2>
            
            <div className="mb-6">
              <div className="flex space-x-4 mb-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="stripe"
                    checked={paymentMethod === 'stripe'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <span className="ml-2">Credit Card (Stripe)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="midtrans"
                    checked={paymentMethod === 'midtrans'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <span className="ml-2">Midtrans</span>
                </label>
              </div>
            </div>

            {paymentMethod === 'stripe' ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    id="cardNumber"
                    placeholder="0000 0000 0000 0000"
                    className="input w-full"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      id="expiry"
                      placeholder="MM/YY"
                      className="input w-full"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      id="cvv"
                      placeholder="123"
                      className="input w-full"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                  </svg>
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Midtrans Payment</h3>
                <p className="mt-1 text-sm text-gray-500">Secure payment gateway</p>
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={handleEnroll}
                disabled={processing}
                className={`w-full py-3 px-4 rounded-md shadow-sm text-sm font-medium text-white ${
                  processing ? 'bg-gray-400' : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                {processing ? 'Processing...' : `Pay $${(course.price.amount * 1.1).toFixed(2)}`}
              </button>
            </div>

            <div className="mt-4 text-center">
              <Link to={`/courses/${courseId}`} className="text-sm font-medium text-primary-600 hover:text-primary-500">
                Back to course
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}