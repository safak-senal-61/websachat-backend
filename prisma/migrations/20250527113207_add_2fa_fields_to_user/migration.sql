/*
  Warnings:

  - A unique constraint covering the columns `[emailVerificationToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[passwordResetToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `emailVerificationExpiresAt` DATETIME(3) NULL,
    ADD COLUMN `emailVerificationToken` VARCHAR(191) NULL,
    ADD COLUMN `passwordResetExpiresAt` DATETIME(3) NULL,
    ADD COLUMN `passwordResetToken` VARCHAR(191) NULL,
    ADD COLUMN `twoFactorEnabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `twoFactorRecoveryCodes` JSON NULL,
    ADD COLUMN `twoFactorSecret` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_emailVerificationToken_key` ON `User`(`emailVerificationToken`);

-- CreateIndex
CREATE UNIQUE INDEX `User_passwordResetToken_key` ON `User`(`passwordResetToken`);
