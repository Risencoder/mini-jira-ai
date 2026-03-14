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
  addMemberToProjectService,
};