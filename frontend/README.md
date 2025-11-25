# eLearning Platform - Frontend

React-based web interface for the eLearning Platform with role-based dashboards, course management, and interactive features.

## Tech Stack

- **Framework**: React 18 with Vite
- **Routing**: React Router v6
- **State Management**: Zustand
- **API Client**: Axios with React Query
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form
- **Payments**: Stripe React

## Project Structure

```
frontend/
├── src/
│   ├── components/           # Reusable components
│   │   ├── common/          # Buttons, Inputs, Cards
│   │   ├── layout/          # Layouts (Main, Dashboard)
│   │   └── course/          # Course-specific components
│   ├── pages/               # Page components
│   │   ├── auth/            # Login, Register
│   │   ├── admin/           # Admin dashboard & management
│   │   ├── mentor/          # Mentor course/quest management
│   │   ├── student/         # Student dashboard, courses, quests
│   │   ├── courses/         # Course browsing & details
│   │   └── forum/           # Q&A forum
│   ├── store/               # Zustand stores
│   ├── utils/               # API client, helpers
│   ├── App.jsx              # Main app with routing
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── index.html              # HTML template
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
└── package.json            # Dependencies
```

## Quick Start

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
# Start development server
npm run dev

# Access at http://localhost:3000
```

### Build for Production

```bash
npm run build
# Output in dist/ directory
```

## Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:5001/api
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_key
```

## Features by Role

### Public Features
- Course catalog browsing
- Course details viewing
- Q&A forum (read-only)
- User registration & login

### Student Dashboard
- Enroll in courses
- View enrolled courses with progress
- Take quests (assessments)
- View earned certificates
- Participate in forum discussions
- Payment history

### Mentor Dashboard
- Create and manage courses
- Create quest/assessments
- Propose course pricing
- View approval status
- Track course enrollments
- Participate in forums

### Admin Dashboard
- System statistics overview
- Approve/reject courses
- Approve/reject pricing
- Approve/reject quests
- Manage users (roles, status)
- View all platform activity

## Key Components

### Authentication
- JWT token storage in localStorage
- Automatic token refresh
- Protected routes by role
- Redirect on unauthorized access

### Course Management
- Rich course creation form
- Content builder (videos, articles)
- Pricing management
- Status tracking (pending/approved/rejected)

### Quest System
- Multiple question types
- Auto-grading interface
- Timer functionality
- Result display with certificate

### Forum
- Question creation with tags
- Reply threading
- Voting system (upvote/downvote)
- Accept answer functionality
- Search and filtering

### Payments
- Stripe payment integration
- Secure checkout flow
- Payment history
- Refund requests

## API Integration

All API calls use the centralized `api.js` utility:

```javascript
import { coursesAPI } from './utils/api';

// Get all courses
const courses = await coursesAPI.getAll({ category: 'programming' });

// Create a course
const newCourse = await coursesAPI.create(courseData);
```

## State Management

Using Zustand for global state:

```javascript
import useAuthStore from './store/authStore';

function Component() {
  const { user, login, logout } = useAuthStore();

  // Use auth state and actions
}
```

## Styling

Tailwind CSS with custom utility classes:

```jsx
<button className="btn btn-primary">
  Click Me
</button>

<div className="card">
  <h2>Card Title</h2>
  <p>Card content</p>
</div>
```

## Routes

### Public Routes
- `/` - Home page
- `/login` - Login page
- `/register` - Registration page
- `/courses` - Course catalog
- `/courses/:id` - Course details
- `/forum` - Q&A forum
- `/forum/:id` - Question details

### Student Routes (Protected)
- `/student` - Student dashboard
- `/student/courses` - My enrolled courses
- `/student/quests/:id` - Take quest
- `/student/certificates` - My certificates
- `/student/profile` - Profile settings

### Mentor Routes (Protected)
- `/mentor` - Mentor dashboard
- `/mentor/courses/create` - Create course
- `/mentor/courses/:id/edit` - Edit course
- `/mentor/quests/create` - Create quest
- `/mentor/content` - My content
- `/mentor/profile` - Profile settings

### Admin Routes (Protected)
- `/admin` - Admin dashboard
- `/admin/approvals` - Pending approvals
- `/admin/users` - User management
- `/admin/profile` - Profile settings

## Component Examples

### Creating a Course

```jsx
import { useForm } from 'react-hook-form';
import { coursesAPI } from '../utils/api';

function CreateCourse() {
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    try {
      await coursesAPI.create(data);
      // Success notification
    } catch (error) {
      // Error handling
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} className="input" />
      <button type="submit" className="btn btn-primary">
        Create Course
      </button>
    </form>
  );
}
```

### Taking a Quest

```jsx
import { useState } from 'react';
import { studentAPI } from '../utils/api';

function TakeQuest({ questId }) {
  const [answers, setAnswers] = useState([]);

  const submitQuest = async () => {
    try {
      const result = await studentAPI.submitQuestAttempt(questId, {
        answers,
        timeTaken: 25
      });
      // Show results and certificate if passed
    } catch (error) {
      // Error handling
    }
  };

  return (
    <div className="card">
      {/* Question display */}
      {/* Answer inputs */}
      <button onClick={submitQuest} className="btn btn-primary">
        Submit
      </button>
    </div>
  );
}
```

## Docker Integration

The frontend is integrated into the main Docker Compose setup:

```bash
# From project root
docker-compose up -d

# Frontend accessible at http://localhost:3000
# Proxies API requests to backend at http://localhost:5001
```

## Development Tips

### Hot Module Replacement
Vite provides instant HMR for fast development.

### API Proxy
Vite proxies `/api/*` requests to the backend server, avoiding CORS issues.

### Code Splitting
React Router enables automatic code splitting by route.

### Type Safety
Consider adding TypeScript for better type safety:
```bash
npm install -D typescript @types/react @types/react-dom
```

## Testing

### Manual Testing
1. Start backend: `docker-compose up -d`
2. Start frontend: `npm run dev`
3. Test all user flows

### User Flow Testing
- **Student**: Register → Browse → Enroll → Take Quest → View Certificate
- **Mentor**: Register → Create Course → Create Quest → Wait for Approval
- **Admin**: Login → Review Pending → Approve Content

## Troubleshooting

### API Connection Issues
```bash
# Check if backend is running
curl http://localhost:5001/health

# Verify API URL in .env
VITE_API_URL=http://localhost:5001/api
```

### Build Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
```

### Port Already in Use
```bash
# Change port in vite.config.js
server: {
  port: 3001
}
```

## Performance Optimization

### Production Build
```bash
npm run build
```

The build is optimized with:
- Code splitting
- Tree shaking
- Minification
- Asset optimization

### Lazy Loading
Routes are lazy-loaded for better performance:
```javascript
const Dashboard = lazy(() => import('./pages/Dashboard'));
```

## Security

- JWT tokens stored in localStorage
- Automatic token expiration handling
- Protected routes by role
- CSRF protection via SameSite cookies
- Input validation with React Hook Form
- XSS protection via React's built-in escaping

## Future Enhancements

- [ ] Dark mode support
- [ ] Real-time notifications with WebSockets
- [ ] Offline support with PWA
- [ ] Mobile responsive design improvements
- [ ] Accessibility (WCAG 2.1) compliance
- [ ] Internationalization (i18n)
- [ ] Advanced search with filters
- [ ] Course recommendations
- [ ] Live chat support

## Contributing

When adding new features:
1. Create component in appropriate directory
2. Add route in App.jsx if needed
3. Update API client in utils/api.js
4. Test with different user roles
5. Ensure responsive design

## Support

For frontend issues:
- Check browser console for errors
- Verify API responses in Network tab
- Review component props and state
- Check Vite dev server output

---

Built with React, Tailwind CSS, and Vite
