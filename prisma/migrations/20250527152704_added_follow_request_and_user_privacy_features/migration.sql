-- DropForeignKey
ALTER TABLE `Follow` DROP FOREIGN KEY `Follow_followerId_fkey`;

-- DropForeignKey
ALTER TABLE `Follow` DROP FOREIGN KEY `Follow_followingId_fkey`;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `isPrivate` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `FollowRequest` (
    `id` VARCHAR(191) NOT NULL,
    `requesterId` VARCHAR(191) NOT NULL,
    `recipientId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `FollowRequest_requesterId_idx`(`requesterId`),
    INDEX `FollowRequest_recipientId_idx`(`recipientId`),
    INDEX `FollowRequest_status_idx`(`status`),
    UNIQUE INDEX `FollowRequest_requesterId_recipientId_key`(`requesterId`, `recipientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Follow` ADD CONSTRAINT `Follow_followerId_fkey` FOREIGN KEY (`followerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Follow` ADD CONSTRAINT `Follow_followingId_fkey` FOREIGN KEY (`followingId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FollowRequest` ADD CONSTRAINT `FollowRequest_requesterId_fkey` FOREIGN KEY (`requesterId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FollowRequest` ADD CONSTRAINT `FollowRequest_recipientId_fkey` FOREIGN KEY (`recipientId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
