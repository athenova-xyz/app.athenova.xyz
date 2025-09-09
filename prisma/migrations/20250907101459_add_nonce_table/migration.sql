-- CreateTable
CREATE TABLE "public"."Nonce" (
    "id" TEXT NOT NULL,
    -- Store a SHA-256 hex digest (64 chars). Use fixed-length to catch malformed writes early.
    "hashed" CHAR(64) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Nonce_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Nonce_hashed_key" ON "public"."Nonce"("hashed");

-- CreateIndex: keep a general index on expiresAt for time-based queries.
CREATE INDEX "Nonce_expiresAt_idx" ON "public"."Nonce"("expiresAt");

-- CreateIndex: speeds up cleanup queries like: DELETE FROM "Nonce" WHERE NOT "used" AND "expiresAt" < now();
CREATE INDEX "Nonce_cleanup_idx" ON "public"."Nonce"("expiresAt") WHERE (NOT "used");
