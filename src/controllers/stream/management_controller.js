// src/controllers/stream/management_controller.js
const { PrismaClient, UserRole, Prisma } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');
const { generateRtcToken, agoraAppId } = require('../../services/agora_service.js');

const STREAM_STATUS = { LIVE: 'LIVE', SCHEDULED: 'SCHEDULED', ENDED: 'ENDED', CANCELLED: 'CANCELLED' };

// Helper: Yanıtı temizlemek için (BigInt -> String)
const sanitizeStreamResponse = (stream) => {
    if (!stream) return null;
    const streamData = { ...stream };
    if (streamData.totalDiamondsReceived != null) {
        streamData.totalDiamondsReceived = streamData.totalDiamondsReceived.toString();
    }
    return streamData;
};

exports.createOrUpdateStream = async (req, res) => {
    const broadcasterId = req.user.userId;
    // Multer, metin alanlarını req.body'ye, dosyayı req.file'a koyar.
    const { title, status, startTime } = req.body;

    try {
        if (status === STREAM_STATUS.LIVE) {
            const existingLiveStream = await prisma.stream.findFirst({
                where: { broadcasterId, status: STREAM_STATUS.LIVE }
            });
            if (existingLiveStream) {
                return Response.conflict(res, "Zaten devam eden bir canlı yayınınız var.");
            }
        }

        // YENİ EKLENEN KISIM: Yüklenen dosyanın URL'ini al
        let coverImageUrl = null;
        if (req.file) {
            // Dosyanın public URL'ini oluştur
            coverImageUrl = `/images/streams/${req.file.filename}`;
        }
        // --- BİTİŞ ---

        const newStreamData = {
            broadcasterId,
            title: title || "Canlı Yayın Odası",
            status: status || STREAM_STATUS.LIVE,
            startTime: (status === STREAM_STATUS.SCHEDULED && startTime) ? new Date(startTime) : new Date(),
            coverImageUrl: coverImageUrl, // Veritabanına kaydetmek için ekle
        };

        const stream = await prisma.stream.create({ data: newStreamData });
        
        let agoraToken = null;
        if (stream.status === STREAM_STATUS.LIVE) {
            const channelName = stream.id; 
            agoraToken = generateRtcToken(channelName, broadcasterId); 
            if (!agoraToken) {
                console.warn(`Yayın (ID: ${stream.id}) için Agora token üretilemedi.`);
            }
        }

        return Response.created(res, `Yayın başarıyla '${stream.status}' olarak ayarlandı.`, { 
            yayin: sanitizeStreamResponse(stream),
            agora: {
                token: agoraToken,
                appId: agoraAppId,
                channelName: stream.id
            }
        });
    } catch (error) {
        console.error("Yayın oluşturma/güncelleme hatası:", error);
        return Response.internalServerError(res, "Yayın başlatılırken/planlanırken bir hata oluştu.");
    }
};

exports.updateStreamDetails = async (req, res) => {
    const { streamId } = req.params;
    const broadcasterId = req.user.userId;
    const { title, coverImageUrl, tags } = req.body; // Not: Bu endpoint hala JSON kabul ediyor, dosya değil.

    try {
        const stream = await prisma.stream.findUnique({ where: { id: streamId } });
        if (!stream || (stream.broadcasterId !== broadcasterId && req.user.role !== UserRole.ADMIN)) {
            return Response.forbidden(res, "Bu yayının detaylarını güncelleme yetkiniz yok.");
        }

        const dataToUpdate = {};
        if (title !== undefined) dataToUpdate.title = title;
        if (coverImageUrl !== undefined) dataToUpdate.coverImageUrl = coverImageUrl;
        if (tags !== undefined) dataToUpdate.tags = tags;
        
        const updatedStream = await prisma.stream.update({
            where: { id: streamId },
            data: dataToUpdate
        });

        return Response.ok(res, "Yayın detayları güncellendi.", { yayin: sanitizeStreamResponse(updatedStream) });
    } catch (error) {
        console.error("Yayın detayları güncelleme hatası:", error);
        return Response.internalServerError(res, "Yayın detayları güncellenirken bir hata oluştu.");
    }
};

exports.endStream = async (req, res) => {
    const { streamId } = req.params;
    const broadcasterId = req.user.userId;

    try {
        const stream = await prisma.stream.findUnique({ where: { id: streamId } });
        if (!stream || (stream.broadcasterId !== broadcasterId && req.user.role !== UserRole.ADMIN)) {
            return Response.forbidden(res, "Bu yayını sonlandırma yetkiniz yok.");
        }
        if ([STREAM_STATUS.ENDED, STREAM_STATUS.CANCELLED].includes(stream.status)) {
            return Response.ok(res, "Yayın zaten sonlanmış.", { yayin: sanitizeStreamResponse(stream) });
        }

        const endedStream = await prisma.stream.update({
            where: { id: streamId },
            data: {
                status: STREAM_STATUS.ENDED,
                endTime: new Date(),
                currentViewers: 0
            }
        });
        
        return Response.ok(res, "Yayın başarıyla sonlandırıldı.", { yayin: sanitizeStreamResponse(endedStream) });
    } catch (error) {
        console.error("Yayın sonlandırma hatası:", error);
        return Response.internalServerError(res, "Yayın sonlandırılırken bir hata oluştu.");
    }
};