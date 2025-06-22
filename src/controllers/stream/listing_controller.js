// src/controllers/stream/listing_controller.js
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');

const STREAM_STATUS = { LIVE: 'LIVE' };

// Helper: Yanıtı temizlemek için (BigInt -> String)
const sanitizeStreamResponse = (stream) => {
    if (!stream) return null;
    const streamData = { ...stream };
    if (streamData.totalDiamondsReceived != null) {
        streamData.totalDiamondsReceived = streamData.totalDiamondsReceived.toString();
    }
    return streamData;
};
const sanitizeStreamsResponse = (streams) => streams.map(sanitizeStreamResponse);

exports.listActiveStreams = async (req, res) => {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    try {
        const whereConditions = { status: STREAM_STATUS.LIVE };
        if (search) {
            whereConditions.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { broadcaster: { username: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const streams = await prisma.stream.findMany({
            where: whereConditions,
            include: { broadcaster: { select: { id: true, username: true, nickname: true, profilePictureUrl: true } } },
            orderBy: { startTime: 'desc' },
            skip,
            take: parseInt(limit),
        });

        const totalStreams = await prisma.stream.count({ where: whereConditions });

        return Response.ok(res, "Aktif yayınlar listelendi.", {
            yayinlar: sanitizeStreamsResponse(streams),
            meta: { totalItems: totalStreams, currentPage: parseInt(page), totalPages: Math.ceil(totalStreams / limit) }
        });
    } catch (error) {
        console.error("Aktif yayınları listeleme hatası:", error);
        return Response.internalServerError(res, "Aktif yayınlar listelenirken bir hata oluştu.");
    }
};

exports.getStreamDetails = async (req, res) => {
    const { streamId } = req.params;
    try {
        const stream = await prisma.stream.findUnique({
            where: { id: streamId },
            include: { broadcaster: { select: { id: true, username: true, nickname: true, profilePictureUrl: true } } }
        });
        if (!stream) return Response.notFound(res, "Yayın bulunamadı.");

        return Response.ok(res, "Yayın detayları getirildi.", { yayin: sanitizeStreamResponse(stream) });
    } catch (error) {
        console.error("Yayın detayları getirme hatası:", error);
        return Response.internalServerError(res, "Yayın detayları getirilirken bir hata oluştu.");
    }
};

exports.getMyStreams = async (req, res) => {
    const broadcasterId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    try {
        const streams = await prisma.stream.findMany({
            where: { broadcasterId },
            orderBy: { createdAt: 'desc' },
            skip,
            take: parseInt(limit),
        });
        const totalStreams = await prisma.stream.count({ where: { broadcasterId } });

        return Response.ok(res, "Yayınlarınız listelendi.", {
            yayinlar: sanitizeStreamsResponse(streams),
            meta: { totalItems: totalStreams, currentPage: parseInt(page), totalPages: Math.ceil(totalStreams / limit) }
        });
    } catch (error) {
        console.error("Kullanıcının yayınlarını listeleme hatası:", error);
        return Response.internalServerError(res, "Yayınlarınız listelenirken bir hata oluştu.");
    }
};
