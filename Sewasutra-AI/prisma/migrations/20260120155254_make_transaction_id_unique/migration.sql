/*
  Warnings:

  - A unique constraint covering the columns `[transactionId]` on the table `AppPayment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AppPayment_transactionId_key" ON "AppPayment"("transactionId");
