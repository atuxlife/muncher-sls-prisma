/*
  Warnings:

  - Added the required column `transFrom` to the `Movement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transTo` to the `Movement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Movement` ADD COLUMN `transFrom` INTEGER NOT NULL,
    ADD COLUMN `transTo` INTEGER NOT NULL;
