/*
  Warnings:

  - You are about to drop the column `update_at` on the `chat` table. All the data in the column will be lost.
  - You are about to drop the column `update_at` on the `guests` table. All the data in the column will be lost.
  - You are about to drop the column `update_at` on the `message` table. All the data in the column will be lost.
  - You are about to drop the column `update_at` on the `token` table. All the data in the column will be lost.
  - You are about to drop the column `update_at` on the `users` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `guests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentSource" AS ENUM ('paystack');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('NGN', 'USD');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'failed', 'cancelled', 'completed', 'reversed');

-- AlterTable
ALTER TABLE "chat" DROP COLUMN "update_at",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "guests" DROP COLUMN "update_at",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "message" DROP COLUMN "update_at",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "token" DROP COLUMN "update_at",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "update_at",
ADD COLUMN     "credits" INTEGER DEFAULT 50,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "credit_packages" (
    "pk" SERIAL NOT NULL,
    "id" TEXT NOT NULL,
    "credit" INTEGER NOT NULL,
    "amount" DECIMAL(20,2) NOT NULL DEFAULT 0.00,
    "description" TEXT,
    "plan" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_packages_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "payment_histories" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "ref" TEXT,
    "amount" DECIMAL(20,2) NOT NULL DEFAULT 0.00,
    "fee" DECIMAL(20,2) NOT NULL DEFAULT 0.00,
    "currency" "Currency" NOT NULL DEFAULT 'USD',
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "source" "PaymentSource" DEFAULT 'paystack',
    "failure_reason" TEXT,
    "packageId" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exchange_rates" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "unit" TEXT,
    "symbol" TEXT,
    "value" DECIMAL(20,2) NOT NULL DEFAULT 0.00,
    "previous" DECIMAL(20,2) NOT NULL DEFAULT 0.00,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exchange_rates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "credit_packages_id_key" ON "credit_packages"("id");

-- CreateIndex
CREATE UNIQUE INDEX "exchange_rates_unit_key" ON "exchange_rates"("unit");

-- AddForeignKey
ALTER TABLE "payment_histories" ADD CONSTRAINT "payment_histories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
