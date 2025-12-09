const express = require('express');
const {
  getCourseMaterials,
  getMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  uploadMaterialFile
} = require('../controllers/materialController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// All routes will have the course ID in params
router.route('/')
  .get(protect, getCourseMaterials)
  .post(protect, createMaterial);

router.route('/:materialId')
  .get(protect, getMaterial)
  .put(protect, updateMaterial)
  .delete(protect, deleteMaterial);

router.route('/:materialId/upload')
  .post(protect, uploadMaterialFile);

module.exports = router;