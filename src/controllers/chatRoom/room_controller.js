// src/controllers/chatRoom/room.controller.js

const { PrismaClient, ChatRoomStatus, ChatRoomType } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');
const bcrypt = require('bcryptjs');
const { canUserManageRoom } = require('./utils.js');

const createChatRoom = async (req, res) => {
    const { title, description, coverImageUrl, type, password, maxParticipants, speakerSeatCount, tags } = req.body;
    const ownerId = req.user.userId;

    if (!title || !type || !maxParticipants) {
        return Response.badRequest(res, 'Oda başlığı, tipi ve maksimum katılımcı sayısı zorunludur.');
    }

    try {
        const roomTypeEnumValue = ChatRoomType[type.toUpperCase()];
        if (!roomTypeEnumValue) {
            return Response.badRequest(res, "Geçersiz oda tipi sağlandı.");
        }

        let passwordHash = null;
        if (roomTypeEnumValue === ChatRoomType.PRIVATE) {
            if (!password) return Response.badRequest(res, 'Özel odalar için şifre zorunludur.');
            passwordHash = await bcrypt.hash(password, 12);
        }

        const newRoom = await prisma.chatRoom.create({
            data: {
                ownerId,
                title,
                description,
                coverImageUrl,
                type: roomTypeEnumValue,
                passwordHash,
                maxParticipants: parseInt(maxParticipants, 10),
                speakerSeatCount: speakerSeatCount ? parseInt(speakerSeatCount, 10) : 0,
                tags: tags || [],
                activeParticipants: [ownerId],
                currentParticipantCount: 1,
                moderators: [ownerId],
                status: ChatRoomStatus.ACTIVE,
            },
            include: { owner: { select: { id: true, username: true, nickname: true, profilePictureUrl: true } } }
        });
        return Response.created(res, 'Sohbet odası başarıyla oluşturuldu.', { oda: newRoom });
    } catch (error) {
        console.error("Sohbet odası oluşturma hatası:", error);
        return Response.internalServerError(res, 'Sohbet odası oluşturulurken bir hata oluştu.');
    }
};

const getChatRoomById = async (req, res) => {
    const { roomId } = req.params;
    try {
        const room = await prisma.chatRoom.findUnique({
            where: { id: roomId },
            include: {
                owner: { select: { id: true, username: true, nickname: true, profilePictureUrl: true } },
            }
        });
        if (!room) {
            return Response.notFound(res, 'Sohbet odası bulunamadı.');
        }
        return Response.ok(res, 'Sohbet odası detayları başarıyla getirildi.', { oda: room });
    } catch (error) {
        console.error(`Sohbet odası getirme hatası (ID: ${roomId}):`, error);
        return Response.internalServerError(res, 'Sohbet odası detayları getirilirken bir hata oluştu.');
    }
};

const updateChatRoom = async (req, res) => {
    const { roomId } = req.params;
    const updateData = req.body;
    const requesterId = req.user.userId;
    const userRole = req.user.role;

    try {
        if (!await canUserManageRoom(requesterId, userRole, roomId)) {
            return Response.forbidden(res, 'Bu odayı güncelleme yetkiniz yok.');
        }
        // Gelen veriyi işle ve sadece izin verilen alanları güncelle... (Orijinal koddaki detaylı mantık buraya eklenebilir)
        const updatedRoom = await prisma.chatRoom.update({
            where: { id: roomId },
            data: {
                title: updateData.title,
                description: updateData.description
                // ... diğer alanlar
            },
        });
        return Response.ok(res, 'Sohbet odası başarıyla güncellendi.', { oda: updatedRoom });
    } catch (error) {
        console.error(`Oda güncelleme hatası (ID: ${roomId}):`, error);
        return Response.internalServerError(res, 'Oda güncellenirken bir hata oluştu.');
    }
};

const deleteChatRoom = async (req, res) => {
    const { roomId } = req.params;
    const requesterId = req.user.userId;
    const userRole = req.user.role;

    try {
        const room = await prisma.chatRoom.findUnique({ where: { id: roomId } });
        if (!room) {
            return Response.notFound(res, 'Silinecek oda bulunamadı.');
        }

        if (userRole !== 'ADMIN' && room.ownerId !== requesterId) {
            return Response.forbidden(res, 'Bu odayı silme yetkiniz yok.');
        }
        await prisma.chatRoom.delete({ where: { id: roomId } });
        return Response.ok(res, 'Sohbet odası başarıyla silindi.');
    } catch (error) {
        console.error(`Oda silme hatası (ID: ${roomId}):`, error);
        return Response.internalServerError(res, 'Oda silinirken bir hata oluştu.');
    }
};

const uploadCoverImage = async (req, res) => {
    const { roomId } = req.params;
    const requesterId = req.user.userId;
    const userRole = req.user.role;

    try {
        if (!req.file) {
            return Response.badRequest(res, "Yüklenecek bir kapak fotoğrafı dosyası bulunamadı. Lütfen 'coverImage' alanını kontrol edin.");
        }

        if (!await canUserManageRoom(requesterId, userRole, roomId)) {
            return Response.forbidden(res, 'Bu odanın kapak fotoğrafını güncelleme yetkiniz yok.');
        }

        // Dosyanın sunucudaki public URL'ini oluştur
        // Örn: /images/chatroom/coverImage-1678886400000-123456789.jpg
        const imageUrl = `/images/chatroom/${req.file.filename}`;

        // Veritabanında ChatRoom kaydını güncelle
        const updatedRoom = await prisma.chatRoom.update({
            where: { id: roomId },
            data: {
                coverImageUrl: imageUrl
            }
        });

        return Response.ok(res, 'Oda kapak fotoğrafı başarıyla güncellendi.', { oda: updatedRoom });

    } catch (error) {
        console.error(`Oda kapak fotoğrafı yükleme hatası (ID: ${roomId}):`, error);
        return Response.internalServerError(res, 'Kapak fotoğrafı yüklenirken bir hata oluştu.');
    }
};

module.exports = {
    createChatRoom,
    getChatRoomById,
    updateChatRoom,
    deleteChatRoom,
    uploadCoverImage,
};
