const express = require('express');
const {
  getCourseQuest,
  getQuest,
  createQuest,
  updateQuest,
  submitQuest,
  getQuestAttempts,
  getMentorQuests,
  getPendingQuests,
  approveQuest,
  rejectQuest
} = require('../controllers/questController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Routes accessible to students when enrolled
router.use(protect);

router.route('/course/:courseId')
  .get(getCourseQuest);

router.route('/:id')
  .get(getQuest)
  .put(updateQuest); // Only mentor/admin can update

router.route('/:id/submit')
  .post(submitQuest);

router.route('/:id/attempts')
  .get(getQuestAttempts);

// Routes for mentors
router.route('/')
  .post(createQuest);

router.route('/mentor/my-quests')
  .get(getMentorQuests);

// Admin routes
router.use(authorize('admin'));

router.route('/pending')
  .get(getPendingQuests);

router.route('/:id/approve')
  .put(approveQuest);

router.route('/:id/reject')
  .put(rejectQuest);

module.exports = router;