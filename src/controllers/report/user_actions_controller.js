// src/controllers/report/user_actions_controller.js
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');

const REPORT_STATUS = { PENDING: 'PENDING' };

/**
 * Kullanıcının yeni bir rapor oluşturmasını sağlar.
 */
exports.createReport = async (req, res) => {
    const reporterId = req.user.userId;
    const { reportedUserId, reportedStreamId, reportedRoomId, reportedMessageId, reason, description } = req.body;

    if (!reason) {
        return Response.badRequest(res, "Rapor nedeni zorunludur.");
    }
    const reportedCount = [reportedUserId, reportedStreamId, reportedRoomId, reportedMessageId].filter(Boolean).length;
    if (reportedCount !== 1) {
        return Response.badRequest(res, "Sadece bir tür varlık (kullanıcı, yayın, oda veya mesaj) rapor edebilirsiniz.");
    }

    try {
        // Varlıkların var olup olmadığını kontrol etme... (özetlendi)
        if (reportedUserId === reporterId) {
            return Response.badRequest(res, "Kendinizi rapor edemezsiniz.");
        }

        const newReport = await prisma.report.create({
            data: {
                reporterId,
                reportedUserId,
                reportedStreamId,
                reportedRoomId,
                reportedMessageId,
                reason,
                description,
                status: REPORT_STATUS.PENDING,
            },
        });
        
        // TODO: Adminlere bildirim gönder
        return Response.created(res, "Raporunuz başarıyla oluşturuldu.", { rapor: newReport });
    } catch (error) {
        console.error("Rapor oluşturma hatası:", error);
        return Response.internalServerError(res, "Rapor oluşturulurken bir hata oluştu.");
    }
};

/**
 * Giriş yapmış kullanıcının kendi oluşturduğu raporları listeler.
 */
exports.getMyReports = async (req, res) => {
    const reporterId = req.user.userId;
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const whereConditions = { reporterId };
    if (status) {
        whereConditions.status = status.toUpperCase();
    }

    try {
        const reports = await prisma.report.findMany({
            where: whereConditions,
            orderBy: { createdAt: 'desc' },
            skip,
            take: parseInt(limit),
            include: {
                reportedUser: { select: { id: true, username: true, nickname: true } },
                reviewer: { select: { id: true, username: true } }
            }
        });
        const totalReports = await prisma.report.count({ where: whereConditions });

        return Response.ok(res, "Raporlarınız başarıyla listelendi.", {
            raporlar: reports,
            meta: { toplamRapor: totalReports, suankiSayfa: parseInt(page), toplamSayfa: Math.ceil(totalReports / limit) }
        });
    } catch (error) {
        console.error("Kullanıcının raporlarını listeleme hatası:", error);
        return Response.internalServerError(res, "Raporlarınız listelenirken bir hata oluştu.");
    }
};
