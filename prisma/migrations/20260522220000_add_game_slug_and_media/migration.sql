-- Add slug and new fields to Game
ALTER TABLE "Game" ADD COLUMN "slug" TEXT;
ALTER TABLE "Game" ADD COLUMN "shortSummary" TEXT;
ALTER TABLE "Game" ADD COLUMN "releaseDate" TIMESTAMPTZ;
ALTER TABLE "Game" ADD COLUMN "systemRequirements" TEXT;
ALTER TABLE "Game" ADD COLUMN "authorId" TEXT;

-- Create GameScreenshot table
CREATE TABLE "GameScreenshot" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GameScreenshot_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "GameScreenshot_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE
);

-- Create DownloadMirror table
CREATE TABLE "DownloadMirror" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileSize" TEXT,
    "verifiedAt" TIMESTAMPTZ,
    "isOfficial" BOOLEAN NOT NULL DEFAULT false,
    "gameId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DownloadMirror_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "DownloadMirror_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE
);

-- Backfill slugs for existing games (based on title)
UPDATE "Game" SET "slug" = lower(regexp_replace(regexp_replace("title", '[^a-zA-Z0-9]+', '-', 'g'), '^-+|-+$', '', 'g')) WHERE "slug" IS NULL;

-- Handle duplicate slugs by appending -2, -3 etc.
UPDATE "Game" g1 SET "slug" = g1."slug" || '-' || (
    SELECT count(*)::text FROM "Game" g2 WHERE g2."slug" = g1."slug" AND g2."id" < g1."id"
) + 1 WHERE (
    SELECT count(*) FROM "Game" g2 WHERE g2."slug" = g1."slug"
) > 1;

-- Add unique constraint
CREATE UNIQUE INDEX "Game_slug_key" ON "Game"("slug");

-- Make slug required
ALTER TABLE "Game" ALTER COLUMN "slug" SET NOT NULL;

-- Add Game->User relation
ALTER TABLE "Game" ADD CONSTRAINT "Game_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL;
