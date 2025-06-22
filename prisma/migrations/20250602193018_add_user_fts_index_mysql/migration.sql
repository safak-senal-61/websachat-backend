-- CreateIndex
CREATE FULLTEXT INDEX `User_username_nickname_idx` ON `User`(`username`, `nickname`);
