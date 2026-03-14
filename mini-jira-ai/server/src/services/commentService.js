const prisma = require('../config/prisma');

const createCommentService = async ({ taskId, userId, content }) => {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      project: {
        members: {
          some: {
            userId,
          },
        },
      },
    },
  });

  if (!task) {
    return null;
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      authorId: userId,
      taskId,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return comment;
};

const getTaskCommentsService = async ({ taskId, userId }) => {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      project: {
        members: {
          some: {
            userId,
          },
        },
      },
    },
  });

  if (!task) {
    return null;
  }

  const comments = await prisma.comment.findMany({
    where: {
      taskId,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return comments;
};

module.exports = {
  createCommentService,
  getTaskCommentsService,
};