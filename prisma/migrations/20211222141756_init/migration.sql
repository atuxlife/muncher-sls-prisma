-- AlterTable
ALTER TABLE `Movement` MODIFY `transFrom` INTEGER NOT NULL DEFAULT 0,
    MODIFY `transTo` INTEGER NOT NULL DEFAULT 0;
