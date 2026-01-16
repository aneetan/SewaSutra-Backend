/*
  Warnings:

  - A unique constraint covering the columns `[companyId]` on the table `CompanyDocs` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CompanyDocs_companyId_key" ON "CompanyDocs"("companyId");
