-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CLIENT', 'COMPANY', 'ADMIN');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('VERIFIED', 'PENDING', 'DECLINED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CLIENT',
    "password" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PENDING',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
