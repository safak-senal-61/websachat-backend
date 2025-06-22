// src/controllers/report/admin_actions_controller.js
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');

const REPORT_STATUS = { PENDING: 'PENDING', REVIEWED_ACCEPTED: 'REVIEWED_ACCEPTED', REVIEWED_REJECTED: 'REVIEWED_REJECTED' };

/**
 * Tüm raporları listeler (Admin/Moderatör).
 */
exports.listAllReports = async (req, res) => {
    const { page = 1, limit = 10, status, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const whereConditions = {};
    if (status) whereConditions.status = status.toUpperCase();
    if (type) {
        const typeField = `reported${type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}Id`;
        if (prisma.report.fields[typeField]) {
            whereConditions[typeField] = { not: null };
        }
    }

    try {
        const reports = await prisma.report.findMany({
            where: whereConditions,
            orderBy: { createdAt: 'desc' },
            skip,
            take: parseInt(limit),
            include: {
                reporter: { select: { id: true, username: true } },
                reportedUser: { select: { id: true, username: true } },
                reviewer: { select: { id: true, username: true } },
            }
        });
        const totalReports = await prisma.report.count({ where: whereConditions });
        return Response.ok(res, "Tüm raporlar başarıyla listelendi.", {
            raporlar: reports,
            meta: { toplamRapor: totalReports, suankiSayfa: parseInt(page), toplamSayfa: Math.ceil(totalReports / limit) }
        });
    } catch (error) {
        console.error("Tüm raporları listeleme hatası:", error);
        return Response.internalServerError(res, "Raporlar listelenirken bir hata oluştu.");
    }
};

/**
 * Belirli bir raporun detaylarını getirir (Admin/Moderatör).
 */
exports.getReportById = async (req, res) => {
    const { reportId } = req.params;
    try {
        const report = await prisma.report.findUnique({
            where: { id: reportId },
            include: { // Tüm ilişkili verileri getir
                reporter: true,
                reportedUser: true,
                reportedStream: true,
                reportedRoom: true,
                reportedMessage: true,
                reviewer: true
            }
        });
        if (!report) return Response.notFound(res, "Rapor bulunamadı.");
        return Response.ok(res, "Rapor detayları getirildi.", { rapor: report });
    } catch (error) {
        console.error("Rapor detayı getirme hatası:", error);
        return Response.internalServerError(res, "Rapor detayı getirilirken bir hata oluştu.");
    }
};

/**
 * Bir raporun durumunu günceller (Admin/Moderatör).
 */
exports.updateReportStatus = async (req, res) => {
    const { reportId } = req.params;
    const { status } = req.body;
    const reviewerId = req.user.userId;

    if (!status || !Object.values(REPORT_STATUS).includes(status.toUpperCase())) {
        return Response.badRequest(res, `Geçersiz rapor durumu.`);
    }
    
    try {
        const updatedReport = await prisma.report.update({
            where: { id: reportId },
            data: {
                status: status.toUpperCase(),
                reviewedById: reviewerId,
                reviewTimestamp: new Date(),
            },
        });

        // TODO: Raporu yapan kullanıcıya bildirim gönder.
        return Response.ok(res, "Rapor durumu başarıyla güncellendi.", { rapor: updatedReport });
    } catch (error) {
        console.error(`Rapor durumu güncelleme hatası:`, error);
        return Response.internalServerError(res, "Rapor durumu güncellenirken bir hata oluştu.");
    }
};
