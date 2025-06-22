// src/controllers/message/utils_controller.js
const { PrismaClient, UserRole } = require('../../generated/prisma');
const prisma = new PrismaClient();

exports.parseJsonArrayField = (fieldValue) => {
    try {
        if (typeof fieldValue === 'string') return JSON.parse(fieldValue);
        return Array.isArray(fieldValue) ? fieldValue : [];
    } catch (e) { return []; }
};

exports.parseJsonObjectField = (fieldValue) => {
    try {
        if (typeof fieldValue === 'string') return JSON.parse(fieldValue);
        return typeof fieldValue === 'object' && fieldValue !== null && !Array.isArray(fieldValue) ? fieldValue : {};
    } catch (e) { return {}; }
};

exports.canUserAccessConversation = async (userId, conversationId) => {
    // Oda ise
    if (conversationId.length === 25 && conversationId.startsWith('c')) {
        const room = await prisma.chatRoom.findFirst({
            where: {
                id: conversationId,
                OR: [
                    { ownerId: userId },
                    { activeParticipants: { path: '$', array_contains: userId } },
                ],
            },
        });
        return !!room;
    }
    // DM ise
    const participants = conversationId.split('_');
    return participants.includes(userId);
};

exports.canUserManageRoomMessage = async (userId, userRole, roomId, messageSenderId) => {
    if (userId === messageSenderId) return true;
    if (userRole === UserRole.ADMIN) return true;
    const room = await prisma.chatRoom.findUnique({ where: { id: roomId } });
    if (!room) return false;
    if (room.ownerId === userId) return true;
    const moderators = exports.parseJsonArrayField(room.moderators);
    return moderators.includes(userId);
};
