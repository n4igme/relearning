const express = require('express');
const {
  createQuestion,
  getCourseQuestions,
  getQuestion,
  updateQuestion,
  deleteQuestion,
  addReply,
  updateReply,
  deleteReply,
  acceptReply,
  voteQuestion,
  voteReply
} = require('../controllers/forumController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Question routes
router.post('/', protect, createQuestion);
router.get('/course/:courseId', getCourseQuestions);

router.route('/:id')
  .get(getQuestion)
  .put(protect, updateQuestion)
  .delete(protect, deleteQuestion);

router.post('/:id/vote', protect, voteQuestion);

// Reply routes
router.post('/:id/reply', protect, addReply);
router.put('/:questionId/reply/:replyId', protect, updateReply);
router.delete('/:questionId/reply/:replyId', protect, deleteReply);
router.put('/:questionId/reply/:replyId/accept', protect, acceptReply);
router.post('/:questionId/reply/:replyId/vote', protect, voteReply);

module.exports = router;
