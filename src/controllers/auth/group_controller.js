// src/controllers/auth/group_controller.js

const { PrismaClient, UserRole } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');

/**
 * Yeni bir kullanıcı grubu oluşturur
 */
const createGroup = async (req, res) => {
  try {
    // Sadece ADMIN veya MODERATOR rolüne sahip kullanıcılar grup oluşturabilir
    if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.MODERATOR) {
      return Response.forbidden(res, 'Bu işlemi yapmak için yetkiniz yok.');
    }
    
    const { name, description, permissions } = req.body;
    
    if (!name) {
      return Response.badRequest(res, 'Grup adı gereklidir.');
    }
    
    // Aynı isimde grup var mı kontrol et
    const existingGroup = await prisma.userGroup.findFirst({
      where: { name },
    });
    
    if (existingGroup) {
      return Response.conflict(res, 'Bu isimde bir grup zaten mevcut.');
    }
    
    // Yeni grup oluştur
    const newGroup = await prisma.userGroup.create({
      data: {
        name,
        description,
        permissions: permissions || [],
        createdBy: req.user.userId,
      },
    });
    
    return Response.created(res, 'Kullanıcı grubu başarıyla oluşturuldu.', { group: newGroup });
  } catch (error) {
    console.error('Grup oluşturma hatası:', error);
    return Response.internalServerError(res, 'Kullanıcı grubu oluşturulamadı.');
  }
};

/**
 * Kullanıcı gruplarını listeler
 */
const listGroups = async (req, res) => {
  try {
    const groups = await prisma.userGroup.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        permissions: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { members: true },
        },
      },
    });
    
    // Grup üye sayılarını ekle
    const groupsWithMemberCount = groups.map(group => ({
      ...group,
      memberCount: group._count.members,
      _count: undefined,
    }));
    
    return Response.ok(res, 'Kullanıcı grupları başarıyla getirildi.', { groups: groupsWithMemberCount });
  } catch (error) {
    console.error('Grupları getirme hatası:', error);
    return Response.internalServerError(res, 'Kullanıcı grupları getirilemedi.');
  }
};

/**
 * Belirli bir kullanıcı grubunun detaylarını getirir
 */
const getGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;
    
    const group = await prisma.userGroup.findUnique({
      where: { id: groupId },
      include: {
        members: {
          select: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                role: true,
                profilePicture: true,
              },
            },
            role: true,
            joinedAt: true,
          },
        },
      },
    });
    
    if (!group) {
      return Response.notFound(res, 'Kullanıcı grubu bulunamadı.');
    }
    
    // Üye bilgilerini düzenle
    const formattedGroup = {
      ...group,
      members: group.members.map(member => ({
        userId: member.user.id,
        username: member.user.username,
        email: member.user.email,
        role: member.user.role,
        profilePicture: member.user.profilePicture,
        groupRole: member.role,
        joinedAt: member.joinedAt,
      })),
    };
    
    return Response.ok(res, 'Kullanıcı grubu detayları başarıyla getirildi.', { group: formattedGroup });
  } catch (error) {
    console.error('Grup detaylarını getirme hatası:', error);
    return Response.internalServerError(res, 'Kullanıcı grubu detayları getirilemedi.');
  }
};

/**
 * Kullanıcı grubunu günceller
 */
const updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description, permissions } = req.body;
    
    // Grubun var olup olmadığını kontrol et
    const group = await prisma.userGroup.findUnique({
      where: { id: groupId },
      select: { id: true, createdBy: true },
    });
    
    if (!group) {
      return Response.notFound(res, 'Kullanıcı grubu bulunamadı.');
    }
    
    // Sadece ADMIN, MODERATOR veya grubu oluşturan kullanıcı güncelleyebilir
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.MODERATOR &&
      group.createdBy !== req.user.userId
    ) {
      return Response.forbidden(res, 'Bu işlemi yapmak için yetkiniz yok.');
    }
    
    // Güncelleme verilerini hazırla
    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (permissions) updateData.permissions = permissions;
    
    // Grubu güncelle
    const updatedGroup = await prisma.userGroup.update({
      where: { id: groupId },
      data: updateData,
    });
    
    return Response.ok(res, 'Kullanıcı grubu başarıyla güncellendi.', { group: updatedGroup });
  } catch (error) {
    console.error('Grup güncelleme hatası:', error);
    return Response.internalServerError(res, 'Kullanıcı grubu güncellenemedi.');
  }
};

/**
 * Kullanıcı grubunu siler
 */
const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    
    // Grubun var olup olmadığını kontrol et
    const group = await prisma.userGroup.findUnique({
      where: { id: groupId },
      select: { id: true, createdBy: true },
    });
    
    if (!group) {
      return Response.notFound(res, 'Kullanıcı grubu bulunamadı.');
    }
    
    // Sadece ADMIN, MODERATOR veya grubu oluşturan kullanıcı silebilir
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.MODERATOR &&
      group.createdBy !== req.user.userId
    ) {
      return Response.forbidden(res, 'Bu işlemi yapmak için yetkiniz yok.');
    }
    
    // Önce grup üyeliklerini sil
    await prisma.userGroupMembership.deleteMany({
      where: { groupId },
    });
    
    // Grubu sil
    await prisma.userGroup.delete({
      where: { id: groupId },
    });
    
    return Response.ok(res, 'Kullanıcı grubu başarıyla silindi.');
  } catch (error) {
    console.error('Grup silme hatası:', error);
    return Response.internalServerError(res, 'Kullanıcı grubu silinemedi.');
  }
};

/**
 * Kullanıcıyı gruba ekler
 */
const addUserToGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId, role } = req.body;
    
    if (!userId) {
      return Response.badRequest(res, 'Kullanıcı ID gereklidir.');
    }
    
    // Grubun var olup olmadığını kontrol et
    const group = await prisma.userGroup.findUnique({
      where: { id: groupId },
      select: { id: true, createdBy: true },
    });
    
    if (!group) {
      return Response.notFound(res, 'Kullanıcı grubu bulunamadı.');
    }
    
    // Sadece ADMIN, MODERATOR veya grubu oluşturan kullanıcı üye ekleyebilir
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.MODERATOR &&
      group.createdBy !== req.user.userId
    ) {
      return Response.forbidden(res, 'Bu işlemi yapmak için yetkiniz yok.');
    }
    
    // Kullanıcının var olup olmadığını kontrol et
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    
    if (!user) {
      return Response.notFound(res, 'Kullanıcı bulunamadı.');
    }
    
    // Kullanıcı zaten grupta mı kontrol et
    const existingMembership = await prisma.userGroupMembership.findFirst({
      where: {
        userId,
        groupId,
      },
    });
    
    if (existingMembership) {
      return Response.conflict(res, 'Kullanıcı zaten bu grubun üyesi.');
    }
    
    // Kullanıcıyı gruba ekle
    const membership = await prisma.userGroupMembership.create({
      data: {
        userId,
        groupId,
        role: role || 'MEMBER', // Varsayılan rol
      },
    });
    
    return Response.created(res, 'Kullanıcı gruba başarıyla eklendi.', { membership });
  } catch (error) {
    console.error('Kullanıcıyı gruba ekleme hatası:', error);
    return Response.internalServerError(res, 'Kullanıcı gruba eklenemedi.');
  }
};

/**
 * Kullanıcıyı gruptan çıkarır
 */
const removeUserFromGroup = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    
    // Grubun var olup olmadığını kontrol et
    const group = await prisma.userGroup.findUnique({
      where: { id: groupId },
      select: { id: true, createdBy: true },
    });
    
    if (!group) {
      return Response.notFound(res, 'Kullanıcı grubu bulunamadı.');
    }
    
    // Sadece ADMIN, MODERATOR veya grubu oluşturan kullanıcı üye çıkarabilir
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.MODERATOR &&
      group.createdBy !== req.user.userId &&
      req.user.userId !== userId // Kullanıcı kendisini gruptan çıkarabilir
    ) {
      return Response.forbidden(res, 'Bu işlemi yapmak için yetkiniz yok.');
    }
    
    // Üyeliğin var olup olmadığını kontrol et
    const membership = await prisma.userGroupMembership.findFirst({
      where: {
        userId,
        groupId,
      },
    });
    
    if (!membership) {
      return Response.notFound(res, 'Kullanıcı bu grubun üyesi değil.');
    }
    
    // Üyeliği sil
    await prisma.userGroupMembership.delete({
      where: { id: membership.id },
    });
    
    return Response.ok(res, 'Kullanıcı gruptan başarıyla çıkarıldı.');
  } catch (error) {
    console.error('Kullanıcıyı gruptan çıkarma hatası:', error);
    return Response.internalServerError(res, 'Kullanıcı gruptan çıkarılamadı.');
  }
};

/**
 * Gruptaki kullanıcının rolünü günceller
 */
const updateUserRoleInGroup = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const { role } = req.body;
    
    if (!role) {
      return Response.badRequest(res, 'Rol gereklidir.');
    }
    
    // Grubun var olup olmadığını kontrol et
    const group = await prisma.userGroup.findUnique({
      where: { id: groupId },
      select: { id: true, createdBy: true },
    });
    
    if (!group) {
      return Response.notFound(res, 'Kullanıcı grubu bulunamadı.');
    }
    
    // Sadece ADMIN, MODERATOR veya grubu oluşturan kullanıcı rol güncelleyebilir
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.MODERATOR &&
      group.createdBy !== req.user.userId
    ) {
      return Response.forbidden(res, 'Bu işlemi yapmak için yetkiniz yok.');
    }
    
    // Üyeliğin var olup olmadığını kontrol et
    const membership = await prisma.userGroupMembership.findFirst({
      where: {
        userId,
        groupId,
      },
    });
    
    if (!membership) {
      return Response.notFound(res, 'Kullanıcı bu grubun üyesi değil.');
    }
    
    // Üyelik rolünü güncelle
    const updatedMembership = await prisma.userGroupMembership.update({
      where: { id: membership.id },
      data: { role },
    });
    
    return Response.ok(res, 'Kullanıcının gruptaki rolü başarıyla güncellendi.', { membership: updatedMembership });
  } catch (error) {
    console.error('Kullanıcı rolü güncelleme hatası:', error);
    return Response.internalServerError(res, 'Kullanıcının gruptaki rolü güncellenemedi.');
  }
};

/**
 * Kullanıcının üye olduğu grupları listeler
 */
const getUserGroups = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Kullanıcı kendisi veya ADMIN/MODERATOR ise işleme devam et
    if (req.user.userId !== userId && req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.MODERATOR) {
      return Response.forbidden(res, 'Bu işlemi yapmak için yetkiniz yok.');
    }
    
    // Kullanıcının üye olduğu grupları getir
    const memberships = await prisma.userGroupMembership.findMany({
      where: { userId },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            description: true,
            permissions: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: { members: true },
            },
          },
        },
      },
    });
    
    // Grup bilgilerini düzenle
    const groups = memberships.map(membership => ({
      ...membership.group,
      memberCount: membership.group._count.members,
      _count: undefined,
      userRole: membership.role,
      joinedAt: membership.joinedAt,
    }));
    
    return Response.ok(res, 'Kullanıcının grupları başarıyla getirildi.', { groups });
  } catch (error) {
    console.error('Kullanıcı gruplarını getirme hatası:', error);
    return Response.internalServerError(res, 'Kullanıcının grupları getirilemedi.');
  }
};

module.exports = {
  createGroup,
  listGroups,
  getGroupDetails,
  updateGroup,
  deleteGroup,
  addUserToGroup,
  removeUserFromGroup,
  updateUserRoleInGroup,
  getUserGroups,
};