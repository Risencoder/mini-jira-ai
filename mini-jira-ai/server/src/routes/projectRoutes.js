const express = require('express');
const {
  createProject,
  getUserProjects,
  getProjectById,
  addMemberToProject,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', createProject);
router.get('/', getUserProjects);
router.get('/:id', getProjectById);
router.post('/:id/members', addMemberToProject);

module.exports = router;