/*
  Warnings:

  - Added the required column `kana` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `kana` VARCHAR(191) NOT NULL,
    ADD COLUMN `status` INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE `Genba` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `kana` VARCHAR(191) NULL,
    `motouke` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `folderUpdatedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Genba_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Company` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `kana` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UsersOnGenbas` (
    `userId` INTEGER NOT NULL,
    `genbaId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`userId`, `genbaId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UsersOnGenbas` ADD CONSTRAINT `UsersOnGenbas_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UsersOnGenbas` ADD CONSTRAINT `UsersOnGenbas_genbaId_fkey` FOREIGN KEY (`genbaId`) REFERENCES `Genba`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
