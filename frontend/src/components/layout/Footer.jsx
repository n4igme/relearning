import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">eLearning Platform</h3>
            <p className="text-sm">
              Learn new skills, advance your career, and achieve your goals with our comprehensive courses.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/courses" className="hover:text-white transition-colors">Courses</Link></li>
              <li><Link to="/forum" className="hover:text-white transition-colors">Forum</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* For Students */}
          <div>
            <h4 className="text-white font-semibold mb-4">For Students</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/register" className="hover:text-white transition-colors">Sign Up</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
              <li><Link to="/courses" className="hover:text-white transition-colors">Browse Courses</Link></li>
            </ul>
          </div>

          {/* For Mentors */}
          <div>
            <h4 className="text-white font-semibold mb-4">For Mentors</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/register" className="hover:text-white transition-colors">Become a Mentor</Link></li>
              <li><Link to="/mentor" className="hover:text-white transition-colors">Mentor Dashboard</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} eLearning Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
