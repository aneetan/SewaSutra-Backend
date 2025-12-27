/*
  Warnings:

  - Added the required column `commission` to the `AppPayment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyAmount` to the `AppPayment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AppPayment" ADD COLUMN     "commission" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "companyAmount" DOUBLE PRECISION NOT NULL;
