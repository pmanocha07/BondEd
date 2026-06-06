const { ConnectionStatus } = require('@prisma/client');

const prisma = require('../config/prisma');
const AppError = require('../utils/appError');

function buildConnectionPayload(connection, currentUserId) {
  const isStudent = connection.studentId === currentUserId;
  const counterpart = isStudent ? connection.alumni : connection.student;

  return {
    id: connection.id,
    status: connection.status,
    createdAt: connection.createdAt,
    studentId: connection.studentId,
    alumniId: connection.alumniId,
    counterpart: {
      id: counterpart.id,
      email: counterpart.email,
      role: counterpart.role,
      createdAt: counterpart.createdAt,
      profile: counterpart.profile,
    },
  };
}

function parseStatusFilter(status) {
  if (!status) {
    return null;
  }

  const normalized = String(status).trim().toLowerCase();

  if (!Object.values(ConnectionStatus).includes(normalized)) {
    throw new AppError(400, 'status must be pending, accepted, or declined');
  }

  return normalized;
}

async function createConnection(req, res, next) {
  try {
    if (req.user.role !== 'student') {
      throw new AppError(403, 'Only students can create connection requests');
    }

    const { alumniId } = req.body;

    const alumni = await prisma.user.findUnique({
      where: { id: alumniId },
      include: { profile: true },
    });

    if (!alumni || alumni.role !== 'alumni') {
      throw new AppError(404, 'Alumni not found');
    }

    if (alumni.id === req.user.id) {
      throw new AppError(400, 'You cannot request a connection to yourself');
    }

    const existingConnection = await prisma.connection.findUnique({
      where: {
        studentId_alumniId: {
          studentId: req.user.id,
          alumniId,
        },
      },
    });

    if (existingConnection) {
      throw new AppError(409, 'A connection request already exists for this pair');
    }

    const connection = await prisma.connection.create({
      data: {
        studentId: req.user.id,
        alumniId,
        status: 'pending',
      },
      include: {
        student: { include: { profile: true } },
        alumni: { include: { profile: true } },
      },
    });

    return res.status(201).json({ connection: buildConnectionPayload(connection, req.user.id) });
  } catch (error) {
    return next(error);
  }
}

async function updateConnection(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const connection = await prisma.connection.findUnique({
      where: { id },
      include: {
        student: { include: { profile: true } },
        alumni: { include: { profile: true } },
      },
    });

    if (!connection) {
      throw new AppError(404, 'Connection not found');
    }

    if (req.user.role !== 'alumni' || connection.alumniId !== req.user.id) {
      throw new AppError(403, 'Only the target alumnus can update this connection');
    }

    if (connection.status !== 'pending') {
      throw new AppError(400, 'Only pending connections can be updated');
    }

    const normalizedStatus = String(status).trim().toLowerCase();
    if (!['accepted', 'declined'].includes(normalizedStatus)) {
      throw new AppError(400, 'status must be accepted or declined');
    }

    const updated = await prisma.connection.update({
      where: { id },
      data: { status: normalizedStatus },
      include: {
        student: { include: { profile: true } },
        alumni: { include: { profile: true } },
      },
    });

    return res.status(200).json({ connection: buildConnectionPayload(updated, req.user.id) });
  } catch (error) {
    return next(error);
  }
}

async function listConnections(req, res, next) {
  try {
    const status = parseStatusFilter(req.query.status);

    const where = {
      OR: [
        { studentId: req.user.id },
        { alumniId: req.user.id },
      ],
    };

    if (status) {
      where.status = status;
    }

    const connections = await prisma.connection.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        student: { include: { profile: true } },
        alumni: { include: { profile: true } },
      },
    });

    return res.status(200).json({
      data: connections.map((connection) => buildConnectionPayload(connection, req.user.id)),
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createConnection,
  updateConnection,
  listConnections,
};