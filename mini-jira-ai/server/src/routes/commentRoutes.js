const express = require('express');
const {
  createComment,
  getTaskComments,
} = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/tasks/:id/comments', createComment);
router.get('/tasks/:id/comments', getTaskComments);

module.exports = router;