-- Ensure citext extension is available
CREATE EXTENSION IF NOT EXISTS citext;

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "username" SET DATA TYPE CITEXT,
ALTER COLUMN "email" SET DATA TYPE CITEXT;
