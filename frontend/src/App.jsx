import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

// Layouts
import MainLayout from './components/layout/MainLayout';
import DashboardLayout from './components/layout/DashboardLayout';

// Public Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import CoursesList from './pages/courses/CoursesList';
import CourseDetails from './pages/courses/CourseDetails';

import CoursePlayer from './pages/student/CoursePlayer';
import Quest from './pages/student/Quest';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import MyCourses from './pages/student/MyCourses';
import MyCertificates from './pages/student/MyCertificates';
import Checkout from './pages/student/Checkout';

// Mentor Pages
import MyContent from './pages/mentor/MyContent';
import MentorDashboard from './pages/mentor/MentorDashboard';
import CreateCourse from './pages/mentor/CreateCourse';
import CreateQuest from './pages/mentor/CreateQuest';
import CourseContent from './pages/mentor/CourseContent';
import EditCourse from './pages/mentor/EditCourse';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import PendingApprovals from './pages/admin/PendingApprovals';
import UserManagement from './pages/admin/UserManagement';
import AllCourses from './pages/admin/AllCourses';

// Placeholder component for not-yet-implemented pages
function ComingSoon() {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h2>
      <p className="text-gray-600">This feature is under development</p>
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="courses" element={<CoursesList />} />
            <Route path="courses/:id" element={<CourseDetails />} />
            <Route path="checkout/:id" element={<Checkout />} />
            <Route path="forum" element={<ComingSoon />} />
            <Route path="forum/:id" element={<ComingSoon />} />
          </Route>

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentDashboard />} />
            <Route path="courses" element={<MyCourses />} />
            <Route path="certificates" element={<MyCertificates />} />
            <Route path="certificates/:id" element={<ComingSoon />} />
            <Route path="profile" element={<ComingSoon />} />
          </Route>

          {/* Routes with MainLayout but protected */}
          <Route
            path="/learn/:courseId"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <MainLayout>
                  <CoursePlayer />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/quest/:questId"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <MainLayout>
                  <Quest />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Mentor Routes */}
          <Route
            path="/mentor"
            element={
              <ProtectedRoute allowedRoles={['mentor', 'admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<MentorDashboard />} />
            <Route path="create-course" element={<CreateCourse />} />
            <Route path="create-quest" element={<CreateQuest />} />
            <Route path="content" element={<MyContent />} />
            <Route path="content/:courseId" element={<CourseContent />} />
            <Route path="edit-course/:courseId" element={<EditCourse />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="approvals" element={<PendingApprovals />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="courses" element={<AllCourses />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
