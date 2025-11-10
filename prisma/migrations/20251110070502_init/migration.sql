-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "registrationNo" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "establishedYear" TEXT NOT NULL,
    "serviceCategory" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "priceRangeMin" INTEGER NOT NULL,
    "priceRangeMax" INTEGER NOT NULL,
    "avgDeliveryTime" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Services" (
    "serviceId" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "service" TEXT NOT NULL,

    CONSTRAINT "Services_pkey" PRIMARY KEY ("serviceId")
);

-- CreateTable
CREATE TABLE "CompanyDocs" (
    "docsId" SERIAL NOT NULL,
    "logo" BYTEA NOT NULL,
    "businessLicense" BYTEA NOT NULL,
    "ownerId" BYTEA,
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "CompanyDocs_pkey" PRIMARY KEY ("docsId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_registrationNo_key" ON "Company"("registrationNo");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Services" ADD CONSTRAINT "Services_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyDocs" ADD CONSTRAINT "CompanyDocs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
