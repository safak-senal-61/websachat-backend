// src/controllers/chatRoom/utils.js

const { PrismaClient, UserRole } = require('../../generated/prisma');
const prisma = new PrismaClient();

const parseJsonArrayField = (fieldValue) => {
    try {
        if (typeof fieldValue === 'string') {
            return JSON.parse(fieldValue);
        }
        return Array.isArray(fieldValue) ? fieldValue : [];
    } catch (e) {
        return [];
    }
};

const isUserRoomOwner = async (userId, roomId) => {
    const room = await prisma.chatRoom.findUnique({ where: { id: roomId } });
    return room && room.ownerId === userId;
};

const isUserRoomModerator = async (userId, roomId) => {
    const room = await prisma.chatRoom.findUnique({ where: { id: roomId } });
    if (!room) return false;
    const moderators = parseJsonArrayField(room.moderators);
    return moderators.includes(userId);
};

const canUserManageRoom = async (userId, userRole, roomId) => {
    if (userRole === UserRole.ADMIN) return true;
    const isOwner = await isUserRoomOwner(userId, roomId);
    if (isOwner) return true;
    return await isUserRoomModerator(userId, roomId);
};

module.exports = {
    parseJsonArrayField,
    isUserRoomOwner,
    isUserRoomModerator,
    canUserManageRoom,
};
