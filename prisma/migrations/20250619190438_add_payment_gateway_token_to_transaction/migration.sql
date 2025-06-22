/*
  Warnings:

  - A unique constraint covering the columns `[paymentGatewayToken]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Transaction` ADD COLUMN `paymentGatewayToken` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Transaction_paymentGatewayToken_key` ON `Transaction`(`paymentGatewayToken`);
