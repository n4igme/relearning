import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function Home() {
  const { user } = useAuthStore();

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Learn, Grow, and Earn Certificates
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Join our eLearning platform to access quality courses, complete assessments, and earn recognized certificates. Whether you're a student looking to learn or a mentor wanting to teach, we have you covered.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              {!user ? (
                <>
                  <Link
                    to="/register"
                    className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                  >
                    Get started
                  </Link>
                  <Link to="/courses" className="text-sm font-semibold leading-6 text-gray-900">
                    Browse courses <span aria-hidden="true">→</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to={`/${user.role}`}
                    className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
                  >
                    Go to Dashboard
                  </Link>
                  <Link to="/courses" className="text-sm font-semibold leading-6 text-gray-900">
                    Browse courses <span aria-hidden="true">→</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-600">Learn Better</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to succeed
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {/* For Students */}
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  For Students
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Enroll in courses, complete assessments, earn certificates, and engage with mentors in our Q&A forums.
                  </p>
                  <p className="mt-6">
                    <Link to="/register" className="text-sm font-semibold leading-6 text-primary-600">
                      Start learning <span aria-hidden="true">→</span>
                    </Link>
                  </p>
                </dd>
              </div>

              {/* For Mentors */}
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  For Mentors
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Create courses, design assessments, propose pricing, and help students succeed through interactive forums.
                  </p>
                  <p className="mt-6">
                    <Link to="/register" className="text-sm font-semibold leading-6 text-primary-600">
                      Start teaching <span aria-hidden="true">→</span>
                    </Link>
                  </p>
                </dd>
              </div>

              {/* Quality Assured */}
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  Quality Assured
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    All courses and content are reviewed and approved by administrators to ensure high-quality learning experiences.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Ready to start your learning journey?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600">
              Join thousands of students and mentors on our platform. Start learning today!
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/register"
                className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
              >
                Get started
              </Link>
              <Link to="/courses" className="text-sm font-semibold leading-6 text-gray-900">
                Explore courses <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
