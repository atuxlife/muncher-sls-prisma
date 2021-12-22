/*
  Warnings:

  - You are about to alter the column `valmov` on the `Movement` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `valpur` on the `PurchaseOrder` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `balance` on the `User` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.

*/
-- AlterTable
ALTER TABLE `Movement` MODIFY `valmov` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `PurchaseOrder` MODIFY `valpur` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `balance` INTEGER NOT NULL;
