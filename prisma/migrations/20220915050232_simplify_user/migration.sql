/*
  Warnings:

  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `encryptedPassword` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `kana` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `rememberCreatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `resetPasswordSentAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `resetPasswordToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `signInCount` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `createdAt`,
    DROP COLUMN `encryptedPassword`,
    DROP COLUMN `kana`,
    DROP COLUMN `rememberCreatedAt`,
    DROP COLUMN `resetPasswordSentAt`,
    DROP COLUMN `resetPasswordToken`,
    DROP COLUMN `signInCount`,
    DROP COLUMN `updatedAt`;
