-- Drop FileScan table
DROP TABLE IF EXISTS "FileScan";

-- Drop fileName column from Game
ALTER TABLE "Game" DROP COLUMN IF EXISTS "fileName";
