// src/controllers/follow/utils_controller.js

const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();

const parseJsonArrayField = (fieldValue) => {
    try {
        if (typeof fieldValue === 'string') {
            if (fieldValue.trim() === "" || fieldValue.trim().toLowerCase() === "null") {
                return [];
            }
            return JSON.parse(fieldValue);
        }
        return Array.isArray(fieldValue) ? fieldValue : [];
    } catch (e) {
        console.warn(`JSON parse error in parseJsonArrayField for value: '${fieldValue}'. Error: ${e.message}`);
        return [];
    }
};

const checkBlockStatus = async (userId, targetUserId) => {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { blockedUserIds: true } });
    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId }, select: { blockedUserIds: true } });

    const userBlockedTarget = parseJsonArrayField(user?.blockedUserIds).includes(targetUserId);
    const targetBlockedUser = parseJsonArrayField(targetUser?.blockedUserIds).includes(userId);

    return { userBlockedTarget, targetBlockedUser };
};

// Bu yardımcı fonksiyonlar doğrudan export edilmez, diğer controller'lar içinde kullanılır.
// Ancak merkezi bir yerde tutmak kodu temizler. Gerekirse buradan export edilebilirler.
module.exports = {
    parseJsonArrayField,
    checkBlockStatus
};
