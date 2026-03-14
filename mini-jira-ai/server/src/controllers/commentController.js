const {
  createCommentService,
  getTaskCommentsService,
} = require('../services/commentService');

const createComment = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: 'Comment content is required',
      });
    }

    const comment = await createCommentService({
      taskId: req.params.id,
      userId: req.user.id,
      content: content.trim(),
    });

    if (!comment) {
      return res.status(404).json({
        message: 'Task not found',
      });
    }

    return res.status(201).json({
      message: 'Comment added successfully',
      comment,
    });
  } catch (error) {
    console.error('Create comment error:', error);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

const getTaskComments = async (req, res) => {
  try {
    const comments = await getTaskCommentsService({
      taskId: req.params.id,
      userId: req.user.id,
    });

    if (comments === null) {
      return res.status(404).json({
        message: 'Task not found',
      });
    }

    return res.status(200).json({
      comments,
    });
  } catch (error) {
    console.error('Get task comments error:', error);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

module.exports = {
  createComment,
  getTaskComments,
};