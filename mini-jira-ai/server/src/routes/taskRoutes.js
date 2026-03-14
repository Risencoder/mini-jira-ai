const express = require('express');
const {
  createTask,
  getProjectTasks,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', createTask);
router.get('/project/:projectId', getProjectTasks);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;