-- AlterTable
ALTER TABLE `ChatRoom` ADD COLUMN `pinnedMessageIds` JSON NULL;

-- AlterTable
ALTER TABLE `Message` ADD COLUMN `isPinned` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `reactions` JSON NULL,
    ADD COLUMN `repliedToMessageId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `pinnedMessagesInRooms` JSON NULL;

-- CreateIndex
CREATE INDEX `Message_repliedToMessageId_idx` ON `Message`(`repliedToMessageId`);

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_repliedToMessageId_fkey` FOREIGN KEY (`repliedToMessageId`) REFERENCES `Message`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;
