/*
  Warnings:

  - You are about to drop the column `budget` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `cityId` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the `Activity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `City` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Location` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `country` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `destination` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fxRate` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `places` to the `Trip` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_locationId_fkey";

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_tripId_fkey";

-- DropForeignKey
ALTER TABLE "Location" DROP CONSTRAINT "Location_cityId_fkey";

-- DropForeignKey
ALTER TABLE "Trip" DROP CONSTRAINT "Trip_cityId_fkey";

-- AlterTable
ALTER TABLE "Trip" DROP COLUMN "budget",
DROP COLUMN "cityId",
ADD COLUMN     "activitiesCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "currency" TEXT NOT NULL,
ADD COLUMN     "destination" TEXT NOT NULL,
ADD COLUMN     "flightCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "foodCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "fxRate" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "lodgingCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "places" JSONB NOT NULL,
ADD COLUMN     "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "Activity";

-- DropTable
DROP TABLE "City";

-- DropTable
DROP TABLE "Location";
