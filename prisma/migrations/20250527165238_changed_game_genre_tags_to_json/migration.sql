-- AlterTable
ALTER TABLE `Game` ADD COLUMN `averageRating` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `categoryId` VARCHAR(191) NULL,
    ADD COLUMN `developer` VARCHAR(191) NULL,
    ADD COLUMN `likeCount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `platformCompat` JSON NULL,
    ADD COLUMN `playCount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `publisher` VARCHAR(191) NULL,
    ADD COLUMN `ratingCount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `releaseDate` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `GenreTag` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `GenreTag_name_key`(`name`),
    UNIQUE INDEX `GenreTag_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GameGenreTag` (
    `id` VARCHAR(191) NOT NULL,
    `gameId` VARCHAR(191) NOT NULL,
    `genreTagId` VARCHAR(191) NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `GameGenreTag_gameId_idx`(`gameId`),
    INDEX `GameGenreTag_genreTagId_idx`(`genreTagId`),
    UNIQUE INDEX `GameGenreTag_gameId_genreTagId_key`(`gameId`, `genreTagId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GameLike` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `gameId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `GameLike_userId_idx`(`userId`),
    INDEX `GameLike_gameId_idx`(`gameId`),
    UNIQUE INDEX `GameLike_userId_gameId_key`(`userId`, `gameId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GameRating` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `gameId` VARCHAR(191) NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `GameRating_userId_idx`(`userId`),
    INDEX `GameRating_gameId_idx`(`gameId`),
    INDEX `GameRating_rating_idx`(`rating`),
    UNIQUE INDEX `GameRating_userId_gameId_key`(`userId`, `gameId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GameCategory` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `iconUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `GameCategory_name_key`(`name`),
    UNIQUE INDEX `GameCategory_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Game_categoryId_idx` ON `Game`(`categoryId`);

-- CreateIndex
CREATE INDEX `Game_name_idx` ON `Game`(`name`);

-- CreateIndex
CREATE FULLTEXT INDEX `Game_name_description_gameId_idx` ON `Game`(`name`, `description`, `gameId`);

-- AddForeignKey
ALTER TABLE `Game` ADD CONSTRAINT `Game_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `GameCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GameGenreTag` ADD CONSTRAINT `GameGenreTag_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `Game`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GameGenreTag` ADD CONSTRAINT `GameGenreTag_genreTagId_fkey` FOREIGN KEY (`genreTagId`) REFERENCES `GenreTag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GameLike` ADD CONSTRAINT `GameLike_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GameLike` ADD CONSTRAINT `GameLike_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `Game`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GameRating` ADD CONSTRAINT `GameRating_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GameRating` ADD CONSTRAINT `GameRating_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `Game`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
