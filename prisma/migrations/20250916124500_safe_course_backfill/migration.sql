-- Safe follow-up migration: add nullable `description`, backfill, set NOT NULL,
-- backfill NULL titles, then drop legacy columns/index IF they exist.

-- 1) Add `description` column as NULLABLE if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='Course' AND column_name='description'
  ) THEN
    ALTER TABLE "public"."Course" ADD COLUMN "description" TEXT;
  END IF;
END $$;

-- 2) Backfill `description` from legacy columns if present, otherwise set to empty string
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='Course' AND column_name='plainText'
  ) THEN
    UPDATE "public"."Course"
    SET "description" = COALESCE("plainText", '')
    WHERE "description" IS NULL;

  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='Course' AND column_name='content'
  ) THEN
    -- `content` may be JSON; cast to text if present
    UPDATE "public"."Course"
    SET "description" = COALESCE(CAST("content" AS TEXT), '')
    WHERE "description" IS NULL;

  ELSE
    -- No legacy text columns found -- set to empty string where NULL
    UPDATE "public"."Course"
    SET "description" = ''
    WHERE "description" IS NULL;
  END IF;
END $$;

-- 3) Backfill NULL titles to a default value to allow NOT NULL constraint
UPDATE "public"."Course"
SET "title" = 'Untitled Course'
WHERE "title" IS NULL;

-- 4) Make columns NOT NULL (only after backfill)
ALTER TABLE "public"."Course"
  ALTER COLUMN "description" SET NOT NULL;

ALTER TABLE "public"."Course"
  ALTER COLUMN "title" SET NOT NULL;

-- 5) Optionally drop legacy columns if they exist (plainText, draft, content)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='Course' AND column_name='plainText'
  ) THEN
    ALTER TABLE "public"."Course" DROP COLUMN "plainText";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='Course' AND column_name='draft'
  ) THEN
    ALTER TABLE "public"."Course" DROP COLUMN "draft";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='Course' AND column_name='content'
  ) THEN
    ALTER TABLE "public"."Course" DROP COLUMN "content";
  END IF;
END $$;

-- 6) Drop the index if present. Verify that no queries depend on it before dropping.
DROP INDEX IF EXISTS "public"."Course_updatedAt_idx";
