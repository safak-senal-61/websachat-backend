-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `authProvider` VARCHAR(191) NULL,
    `authId` VARCHAR(191) NULL,
    `username` VARCHAR(191) NOT NULL,
    `nickname` VARCHAR(191) NULL,
    `profilePictureUrl` VARCHAR(191) NULL,
    `bio` VARCHAR(191) NULL,
    `gender` VARCHAR(191) NULL,
    `birthDate` DATETIME(3) NULL,
    `country` VARCHAR(191) NULL,
    `region` VARCHAR(191) NULL,
    `level` INTEGER NOT NULL DEFAULT 1,
    `vipLevel` INTEGER NOT NULL DEFAULT 0,
    `coins` BIGINT NOT NULL DEFAULT 0,
    `diamonds` BIGINT NOT NULL DEFAULT 0,
    `isEmailVerified` BOOLEAN NOT NULL DEFAULT false,
    `lastLoginAt` DATETIME(3) NULL,
    `followingCount` INTEGER NOT NULL DEFAULT 0,
    `followerCount` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `isOnline` BOOLEAN NOT NULL DEFAULT false,
    `preferences` JSON NULL,
    `allowDirectMessages` BOOLEAN NOT NULL DEFAULT true,
    `notificationSettings` JSON NULL,
    `blockedUserIds` JSON NULL,
    `accountStatus` VARCHAR(191) NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_authId_key`(`authId`),
    UNIQUE INDEX `User_username_key`(`username`),
    INDEX `User_username_idx`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChatRoom` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `coverImageUrl` VARCHAR(191) NULL,
    `type` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NULL,
    `maxParticipants` INTEGER NOT NULL,
    `currentParticipantCount` INTEGER NOT NULL DEFAULT 0,
    `activeParticipants` JSON NULL,
    `moderators` JSON NULL,
    `speakerSeatCount` INTEGER NOT NULL DEFAULT 0,
    `speakerSeatAssignments` JSON NULL,
    `rtcChannelName` VARCHAR(191) NULL,
    `tags` JSON NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ChatRoom_ownerId_idx`(`ownerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Message` (
    `id` VARCHAR(191) NOT NULL,
    `conversationId` VARCHAR(191) NOT NULL,
    `senderId` VARCHAR(191) NOT NULL,
    `receiverId` VARCHAR(191) NULL,
    `roomId` VARCHAR(191) NULL,
    `messageType` VARCHAR(191) NOT NULL,
    `content` TEXT NULL,
    `giftId` VARCHAR(191) NULL,
    `readStatus` JSON NULL,
    `isDeletedFor` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Message_senderId_idx`(`senderId`),
    INDEX `Message_receiverId_idx`(`receiverId`),
    INDEX `Message_roomId_idx`(`roomId`),
    INDEX `Message_conversationId_idx`(`conversationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transaction` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `transactionType` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `relatedEntityId` VARCHAR(191) NULL,
    `relatedEntityType` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `platform` VARCHAR(191) NULL,
    `platformTransactionId` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Transaction_platformTransactionId_key`(`platformTransactionId`),
    INDEX `Transaction_userId_idx`(`userId`),
    INDEX `Transaction_transactionType_idx`(`transactionType`),
    INDEX `Transaction_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Follow` (
    `id` VARCHAR(191) NOT NULL,
    `followerId` VARCHAR(191) NOT NULL,
    `followingId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Follow_followerId_idx`(`followerId`),
    INDEX `Follow_followingId_idx`(`followingId`),
    UNIQUE INDEX `Follow_followerId_followingId_key`(`followerId`, `followingId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Game` (
    `id` VARCHAR(191) NOT NULL,
    `gameId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `iconUrl` VARCHAR(191) NULL,
    `entryCost` BIGINT NOT NULL DEFAULT 0,
    `rewardStructure` JSON NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Game_gameId_key`(`gameId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GameSession` (
    `id` VARCHAR(191) NOT NULL,
    `gameId` VARCHAR(191) NOT NULL,
    `hostId` VARCHAR(191) NOT NULL,
    `participants` JSON NULL,
    `viewerIds` JSON NULL,
    `maxPlayers` INTEGER NOT NULL,
    `currentPlayers` INTEGER NOT NULL DEFAULT 0,
    `startTime` DATETIME(3) NULL,
    `endTime` DATETIME(3) NULL,
    `status` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `GameSession_gameId_idx`(`gameId`),
    INDEX `GameSession_hostId_idx`(`hostId`),
    INDEX `GameSession_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Gift` (
    `id` VARCHAR(191) NOT NULL,
    `giftId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `animationUrl` VARCHAR(191) NULL,
    `cost` BIGINT NOT NULL,
    `value` BIGINT NOT NULL,
    `category` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Gift_giftId_key`(`giftId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Report` (
    `id` VARCHAR(191) NOT NULL,
    `reporterId` VARCHAR(191) NOT NULL,
    `reportedUserId` VARCHAR(191) NULL,
    `reportedStreamId` VARCHAR(191) NULL,
    `reportedRoomId` VARCHAR(191) NULL,
    `reportedMessageId` VARCHAR(191) NULL,
    `reason` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `reviewedById` VARCHAR(191) NULL,
    `reviewTimestamp` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Report_reporterId_idx`(`reporterId`),
    INDEX `Report_reportedUserId_idx`(`reportedUserId`),
    INDEX `Report_reportedStreamId_idx`(`reportedStreamId`),
    INDEX `Report_reportedRoomId_idx`(`reportedRoomId`),
    INDEX `Report_reportedMessageId_idx`(`reportedMessageId`),
    INDEX `Report_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `recipientId` VARCHAR(191) NOT NULL,
    `senderId` VARCHAR(191) NULL,
    `type` VARCHAR(191) NOT NULL,
    `relatedEntityId` VARCHAR(191) NULL,
    `relatedEntityType` VARCHAR(191) NULL,
    `content` TEXT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Notification_recipientId_idx`(`recipientId`),
    INDEX `Notification_type_idx`(`type`),
    INDEX `Notification_isRead_idx`(`isRead`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Stream` (
    `id` VARCHAR(191) NOT NULL,
    `broadcasterId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `coverImageUrl` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL,
    `startTime` DATETIME(3) NULL,
    `endTime` DATETIME(3) NULL,
    `currentViewers` INTEGER NOT NULL DEFAULT 0,
    `peakViewers` INTEGER NOT NULL DEFAULT 0,
    `totalDiamondsReceived` BIGINT NOT NULL DEFAULT 0,
    `tags` JSON NULL,
    `location` JSON NULL,
    `rtcChannelName` VARCHAR(191) NULL,
    `recordingUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Stream_broadcasterId_idx`(`broadcasterId`),
    INDEX `Stream_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ChatRoom` ADD CONSTRAINT `ChatRoom_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `ChatRoom`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_giftId_fkey` FOREIGN KEY (`giftId`) REFERENCES `Gift`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Follow` ADD CONSTRAINT `Follow_followerId_fkey` FOREIGN KEY (`followerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Follow` ADD CONSTRAINT `Follow_followingId_fkey` FOREIGN KEY (`followingId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GameSession` ADD CONSTRAINT `GameSession_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `Game`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GameSession` ADD CONSTRAINT `GameSession_hostId_fkey` FOREIGN KEY (`hostId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_reporterId_fkey` FOREIGN KEY (`reporterId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_reportedUserId_fkey` FOREIGN KEY (`reportedUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_reportedStreamId_fkey` FOREIGN KEY (`reportedStreamId`) REFERENCES `Stream`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_reportedRoomId_fkey` FOREIGN KEY (`reportedRoomId`) REFERENCES `ChatRoom`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_reportedMessageId_fkey` FOREIGN KEY (`reportedMessageId`) REFERENCES `Message`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_recipientId_fkey` FOREIGN KEY (`recipientId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stream` ADD CONSTRAINT `Stream_broadcasterId_fkey` FOREIGN KEY (`broadcasterId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
