const prisma = require('../config/prisma');

const createTaskService = async ({
  title,
  description,
  status,
  priority,
  dueDate,
  projectId,
  assigneeId,
  createdById,
}) => {
  const task = await prisma.task.create({
    data: {
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : null,
      projectId,
      assigneeId: assigneeId || null,
      createdById,
    },
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      project: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  return task;
};

const getProjectTasksService = async ({ projectId, userId }) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      members: {
        some: {
          userId,
        },
      },
    },
  });

  if (!project) {
    return null;
  }

  const tasks = await prisma.task.findMany({
    where: { projectId },
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return tasks;
};

const updateTaskService = async ({ taskId, userId, data }) => {
  const existingTask = await prisma.task.findFirst({
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

  if (!existingTask) {
    return null;
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(data.title !== undefined && { title: data.title.trim() }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.assigneeId !== undefined && { assigneeId: data.assigneeId || null }),
      ...(data.dueDate !== undefined && {
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      }),
    },
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      project: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  return updatedTask;
};

const deleteTaskService = async ({ taskId, userId }) => {
  const existingTask = await prisma.task.findFirst({
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

  if (!existingTask) {
    return null;
  }

  await prisma.comment.deleteMany({
    where: {
      taskId,
    },
  });

  await prisma.task.delete({
    where: {
      id: taskId,
    },
  });

  return true;
};



module.exports = {
  createTaskService,
  getProjectTasksService,
  updateTaskService,
  deleteTaskService,
};