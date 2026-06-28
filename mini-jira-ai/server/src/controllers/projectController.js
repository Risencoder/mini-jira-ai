const {
  createProjectService,
  getUserProjectsService,
  getProjectByIdService,
  updateProjectService,
  deleteProjectService,
  addMemberToProjectService,
} = require('../services/projectService');

const createProject = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: 'Project title is required',
      });
    }

    const project = await createProjectService({
      title: title.trim(),
      description: description?.trim() || null,
      userId: req.user.id,
    });

    return res.status(201).json({
      message: 'Project created successfully',
      project,
    });
  } catch (error) {
    console.error('Create project error:', error);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

const getUserProjects = async (req, res) => {
  try {
    const projects = await getUserProjectsService(req.user.id);

    return res.status(200).json({
      projects,
    });
  } catch (error) {
    console.error('Get projects error:', error);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await getProjectByIdService({
      projectId: req.params.id,
      userId: req.user.id,
    });

    if (!project) {
      return res.status(404).json({
        message: 'Project not found',
      });
    }

    return res.status(200).json({
      project,
    });
  } catch (error) {
    console.error('Get project by id error:', error);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

const updateProject = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: 'Project title is required',
      });
    }

    const project = await updateProjectService({
      projectId: req.params.id,
      userId: req.user.id,
      title: title.trim(),
      description: description?.trim() || null,
    });

    if (!project) {
      return res.status(404).json({
        message: 'Project not found',
      });
    }

    return res.status(200).json({
      message: 'Project updated successfully',
      project,
    });
  } catch (error) {
    console.error('Update project error:', error);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    const deleted = await deleteProjectService({
      projectId: req.params.id,
      userId: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({
        message: 'Project not found',
      });
    }

    return res.status(200).json({
      message: 'Project deleted successfully',
    });
  } catch (error) {
    console.error('Delete project error:', error);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

const addMemberToProject = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        message: 'Email is required',
      });
    }

    const result = await addMemberToProjectService({
      projectId: req.params.id,
      currentUserId: req.user.id,
      email: email.trim().toLowerCase(),
      role,
    });

    if (result.error === 'PROJECT_NOT_FOUND') {
      return res.status(404).json({
        message: 'Project not found',
      });
    }

    if (result.error === 'USER_NOT_FOUND') {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    if (result.error === 'ALREADY_MEMBER') {
      return res.status(409).json({
        message: 'User is already a member of this project',
      });
    }

    return res.status(201).json({
      message: 'Member added successfully',
      member: result.member,
    });
  } catch (error) {
    console.error('Add member error:', error);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

module.exports = {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMemberToProject,
};
