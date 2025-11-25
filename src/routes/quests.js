const express = require('express');
const {
  createQuest,
  getCourseQuests,
  getQuest,
  updateQuest,
  deleteQuest,
  getMyQuests
} = require('../controllers/questController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, authorize('admin', 'mentor'), createQuest);
router.get('/mentor/my-quests', protect, authorize('admin', 'mentor'), getMyQuests);
router.get('/course/:courseId', getCourseQuests);

router.route('/:id')
  .get(protect, getQuest)
  .put(protect, authorize('admin', 'mentor'), updateQuest)
  .delete(protect, authorize('admin', 'mentor'), deleteQuest);

module.exports = router;
