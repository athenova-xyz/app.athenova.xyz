/*
  Warnings:

  - You are about to drop the column `content` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `draft` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `plainText` on the `Course` table. All the data in the column will be lost.
  - Added the required column `description` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Made the column `title` on table `Course` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "public"."Course_updatedAt_idx";

-- AlterTable
ALTER TABLE "public"."Course" DROP COLUMN "content",
DROP COLUMN "draft",
DROP COLUMN "plainText",
ADD COLUMN     "description" TEXT NOT NULL,
ALTER COLUMN "title" SET NOT NULL;
