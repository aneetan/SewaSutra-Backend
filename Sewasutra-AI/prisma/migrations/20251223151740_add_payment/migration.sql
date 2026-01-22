-- CreateEnum
CREATE TYPE "StatusForPayment" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "AppPayment" (
    "id" SERIAL NOT NULL,
    "gateway" "PaymentType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "StatusForPayment" NOT NULL DEFAULT 'PENDING',
    "gatewayRefId" TEXT,
    "transactionId" TEXT NOT NULL,
    "gatewayPayload" JSONB,
    "contractId" INTEGER NOT NULL,
    "clientId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AppPayment_contractId_idx" ON "AppPayment"("contractId");

-- CreateIndex
CREATE INDEX "AppPayment_clientId_idx" ON "AppPayment"("clientId");

-- CreateIndex
CREATE INDEX "AppPayment_companyId_idx" ON "AppPayment"("companyId");

-- CreateIndex
CREATE INDEX "AppPayment_gateway_idx" ON "AppPayment"("gateway");

-- CreateIndex
CREATE INDEX "AppPayment_status_idx" ON "AppPayment"("status");

-- AddForeignKey
ALTER TABLE "AppPayment" ADD CONSTRAINT "AppPayment_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppPayment" ADD CONSTRAINT "AppPayment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppPayment" ADD CONSTRAINT "AppPayment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
