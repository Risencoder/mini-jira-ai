const {
  createTaskService,
  getProjectTasksService,
  updateTaskService,
  deleteTaskService,
} = require('../services/taskService');

const VALID_TASK_STATUSES = ['todo', 'in_progress', 'done'];

const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      projectId,
      assigneeId,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: 'Task title is required',
      });
    }

    if (!projectId) {
      return res.status(400).json({
        message: 'Project ID is required',
      });
    }

    if (status !== undefined && !VALID_TASK_STATUSES.includes(status)) {
      return res.status(400).json({
        message: 'Invalid task status',
      });
    }

    const task = await createTaskService({
      title: title.trim(),
      description: description?.trim() || null,
      status,
      priority,
      dueDate,
      projectId,
      assigneeId,
      createdById: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        message: 'Project not found',
      });
    }

    return res.status(201).json({
      message: 'Task created successfully',
      task,
    });
  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

const getProjectTasks = async (req, res) => {
  try {
    const tasks = await getProjectTasksService({
      projectId: req.params.projectId,
      userId: req.user.id,
    });

    if (tasks === null) {
      return res.status(404).json({
        message: 'Project not found',
      });
    }

    return res.status(200).json({
      tasks,
    });
  } catch (error) {
    console.error('Get project tasks error:', error);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

const updateTask = async (req, res) => {
  try {
    if (
      req.body.status !== undefined &&
      !VALID_TASK_STATUSES.includes(req.body.status)
    ) {
      return res.status(400).json({
        message: 'Invalid task status',
      });
    }

    const updatedTask = await updateTaskService({
      taskId: req.params.id,
      userId: req.user.id,
      data: req.body,
    });

    if (!updatedTask) {
      return res.status(404).json({
        message: 'Task not found',
      });
    }

    return res.status(200).json({
      message: 'Task updated successfully',
      task: updatedTask,
    });
  } catch (error) {
    console.error('Update task error:', error);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const deleted = await deleteTaskService({
      taskId: req.params.id,
      userId: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({
        message: 'Task not found',
      });
    }

    return res.status(200).json({
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

module.exports = {
  createTask,
  getProjectTasks,
  updateTask,
  deleteTask,
};
