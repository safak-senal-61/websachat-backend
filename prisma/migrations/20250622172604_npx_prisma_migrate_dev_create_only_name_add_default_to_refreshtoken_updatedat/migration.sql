-- First add the columns
-- AlterTable
ALTER TABLE `RefreshToken` ADD COLUMN `ipAddress` VARCHAR(45) NULL,
    ADD COLUMN `lastUsedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `userAgent` VARCHAR(255) NULL;

-- Then update existing records to set updatedAt to the same value as createdAt if needed
-- This is now redundant since we added DEFAULT CURRENT_TIMESTAMP(3) to updatedAt
-- UPDATE `RefreshToken` SET `updatedAt` = `createdAt` WHERE 1=1;
