const express = require('express');
const {
  createCourse,
  getAllCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  getMyCourses,
  addMaterial,
  updateMaterial,
  deleteMaterial,
  addSubMaterial,
  updateSubMaterial,
  deleteSubMaterial
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getAllCourses)
  .post(protect, authorize('admin', 'mentor'), createCourse);

router.get('/mentor/my-courses', protect, authorize('admin', 'mentor'), getMyCourses);

router.route('/:id')
  .get(getCourse)
  .put(protect, authorize('admin', 'mentor'), updateCourse)
  .delete(protect, authorize('admin', 'mentor'), deleteCourse);

// Material (Bab) routes
router.post('/:id/materials', protect, authorize('admin', 'mentor'), addMaterial);
router.put('/:courseId/materials/:materialId', protect, authorize('admin', 'mentor'), updateMaterial);
router.delete('/:courseId/materials/:materialId', protect, authorize('admin', 'mentor'), deleteMaterial);

// Sub-material (Sub-Bab) routes
router.post('/:courseId/materials/:materialId/sub-materials', protect, authorize('admin', 'mentor'), addSubMaterial);
router.put('/:courseId/materials/:materialId/sub-materials/:subMaterialId', protect, authorize('admin', 'mentor'), updateSubMaterial);
router.delete('/:courseId/materials/:materialId/sub-materials/:subMaterialId', protect, authorize('admin', 'mentor'), deleteSubMaterial);

module.exports = router;
