import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { coursesAPI } from '../../utils/api';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Badge from '../../components/common/Badge';

export default function CoursesList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    search: ''
  });

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.difficulty) params.difficulty = filters.difficulty;
      if (filters.search) params.search = filters.search;

      const response = await coursesAPI.getAll(params);
      setCourses(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const categories = ['programming', 'design', 'business', 'marketing', 'data-science'];
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Explore Courses</h1>
          <p className="mt-2 text-gray-600">
            Discover and enroll in courses to advance your skills
          </p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search courses..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="input w-full"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="input"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              className="input"
            >
              <option value="">All Levels</option>
              {difficulties.map((diff) => (
                <option key={diff} value={diff}>
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Results Count */}
        <div className="mb-4 text-gray-600">
          {loading ? 'Loading...' : `${courses.length} course${courses.length !== 1 ? 's' : ''} found`}
        </div>

        {/* Courses Grid */}
        {loading ? (
          <Loading text="Loading courses..." />
        ) : courses.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-600">
                Try adjusting your filters or search query
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course._id} className="hover:shadow-xl transition-shadow">
                <div className="space-y-4">
                  {/* Course Header */}
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
                        {course.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {course.description}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="primary">{course.category}</Badge>
                    <Badge variant="default">{course.difficulty}</Badge>
                  </div>

                  {/* Course Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span className="flex items-center">
                      <span className="mr-1">👥</span>
                      {course.enrollmentCount || 0} students
                    </span>
                    <span className="flex items-center">
                      <span className="mr-1">⭐</span>
                      {course.rating?.average > 0 ? course.rating.average.toFixed(1) : 'New'}
                    </span>
                  </div>

                  {/* Price and Action */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div>
                      {course.price?.amount > 0 ? (
                        <div className="text-2xl font-bold text-gray-900">
                          ${course.price.amount}
                        </div>
                      ) : (
                        <Badge variant="success" size="lg">Free</Badge>
                      )}
                    </div>
                    <Link
                      to={`/courses/${course._id}`}
                      className="btn btn-primary"
                    >
                      View Course
                    </Link>
                  </div>

                  {/* Mentor Info */}
                  <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                    By {course.creator?.name || 'Anonymous'}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
