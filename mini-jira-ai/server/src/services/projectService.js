const prisma = require('../config/prisma');

const createProjectService = async ({ title, description, userId }) => {
  const project = await prisma.project.create({
    data: {
      title,
      description,
      ownerId: userId,
      members: {
        create: {
          userId,
          role: 'owner',
        },
      },
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return project;
};

const getUserProjectsService = async (userId) => {
  const projects = await prisma.project.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return projects;
};

const getProjectByIdService = async ({ projectId, userId }) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      tasks: true,
    },
  });

  return project;
};

const updateProjectService = async ({ projectId, userId, title, description }) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId: userId,
    },
  });

  if (!project) {
    return null;
  }

  const updatedProject = await prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      title,
      description,
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      tasks: true,
    },
  });

  return updatedProject;
};

const deleteProjectService = async ({ projectId, userId }) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId: userId,
    },
  });

  if (!project) {
    return null;
  }

  await prisma.$transaction([
    prisma.comment.deleteMany({
      where: {
        task: {
          projectId,
        },
      },
    }),
    prisma.task.deleteMany({
      where: {
        projectId,
      },
    }),
    prisma.projectMember.deleteMany({
      where: {
        projectId,
      },
    }),
    prisma.project.delete({
      where: {
        id: projectId,
      },
    }),
  ]);

  return true;
};

const addMemberToProjectService = async ({ projectId, currentUserId, email, role }) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      members: {
        some: {
          userId: currentUserId,
        },
      },
    },
  });

  if (!project) {
    return { error: 'PROJECT_NOT_FOUND' };
  }

  const userToAdd = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!userToAdd) {
    return { error: 'USER_NOT_FOUND' };
  }

  const existingMember = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: userToAdd.id,
        projectId,
      },
    },
  });

  if (existingMember) {
    return { error: 'ALREADY_MEMBER' };
  }

  const member = await prisma.projectMember.create({
    data: {
      userId: userToAdd.id,
      projectId,
      role: role || 'member',
    },
    include: {
      user: {
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

  return { member };
};

module.exports = {
  createProjectService,
  getUserProjectsService,
  getProjectByIdService,
  updateProjectService,
  deleteProjectService,
  addMemberToProjectService,
};
