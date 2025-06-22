/*
  Warnings:

  - You are about to alter the column `type` on the `ChatRoom` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(4))`.
  - You are about to alter the column `status` on the `ChatRoom` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(5))`.
  - You are about to alter the column `status` on the `FollowRequest` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(9))`.
  - You are about to alter the column `status` on the `GameSession` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(10))`.
  - You are about to alter the column `messageType` on the `Message` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(6))`.
  - You are about to alter the column `type` on the `Notification` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(12))`.
  - You are about to alter the column `status` on the `Report` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(11))`.
  - You are about to alter the column `status` on the `Stream` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(13))`.
  - You are about to alter the column `transactionType` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(7))`.
  - You are about to alter the column `status` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(8))`.
  - You are about to alter the column `gender` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.
  - You are about to alter the column `status` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.
  - You are about to alter the column `accountStatus` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(2))`.

*/
-- AlterTable
ALTER TABLE `ChatRoom` MODIFY `type` ENUM('PUBLIC', 'PRIVATE', 'VOICE_ONLY') NOT NULL,
    MODIFY `status` ENUM('ACTIVE', 'CLOSED', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE `FollowRequest` MODIFY `status` ENUM('PENDING', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `GameSession` MODIFY `status` ENUM('WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'WAITING';

-- AlterTable
ALTER TABLE `Message` MODIFY `messageType` ENUM('TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'GIFT', 'SYSTEM') NOT NULL;

-- AlterTable
ALTER TABLE `Notification` MODIFY `type` ENUM('NEW_FOLLOWER', 'MESSAGE_RECEIVED', 'GIFT_RECEIVED', 'SYSTEM_ANNOUNCEMENT', 'FRIEND_REQUEST_RECEIVED', 'FRIEND_REQUEST_ACCEPTED', 'REPORT_UPDATE') NOT NULL;

-- AlterTable
ALTER TABLE `Report` MODIFY `status` ENUM('PENDING', 'REVIEWED_ACCEPTED', 'REVIEWED_REJECTED', 'RESOLVED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `Stream` MODIFY `status` ENUM('LIVE', 'OFFLINE', 'SCHEDULED', 'ENDED') NOT NULL DEFAULT 'OFFLINE';

-- AlterTable
ALTER TABLE `Transaction` MODIFY `transactionType` ENUM('COIN_PURCHASE', 'GIFT_SEND', 'DIAMOND_CONVERSION', 'STREAM_REWARD') NOT NULL,
    MODIFY `status` ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `User` MODIFY `gender` ENUM('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_SAY') NULL,
    MODIFY `status` ENUM('ACTIVE', 'INACTIVE', 'BANNED') NOT NULL DEFAULT 'ACTIVE',
    MODIFY `accountStatus` ENUM('ACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE';
