/*
  Warnings:

  - You are about to drop the column `paidAmount` on the `Payment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "paidAmount",
ALTER COLUMN "status" SET DEFAULT 'completed';
