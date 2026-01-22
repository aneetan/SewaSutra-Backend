/*
  Warnings:

  - Added the required column `status` to the `Bid` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BidStatus" AS ENUM ('DECLINED', 'ACCEPTED', 'INITIATED', 'PENDING');

-- AlterTable
ALTER TABLE "Bid" ADD COLUMN     "status" "BidStatus" NOT NULL;
