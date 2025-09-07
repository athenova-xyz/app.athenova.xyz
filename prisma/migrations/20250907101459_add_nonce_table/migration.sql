-- CreateTable
CREATE TABLE "public"."Nonce" (
    "id" TEXT NOT NULL,
    "hashed" VARCHAR(128) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Nonce_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Nonce_hashed_key" ON "public"."Nonce"("hashed");

-- CreateIndex
CREATE INDEX "Nonce_expiresAt_idx" ON "public"."Nonce"("expiresAt");
