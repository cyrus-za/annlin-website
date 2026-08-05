ALTER TYPE "ArticleStatus" ADD VALUE IF NOT EXISTS 'ARCHIVED';
ALTER TYPE "ReadingMaterialFileType" ADD VALUE IF NOT EXISTS 'AUDIO';

ALTER TABLE "articles"
ADD COLUMN "contentDate" DATE,
ADD COLUMN "showDate" BOOLEAN NOT NULL DEFAULT true;

UPDATE "articles"
SET "contentDate" = COALESCE("publishedAt"::date, "createdAt"::date);

ALTER TABLE "articles"
ALTER COLUMN "contentDate" SET NOT NULL,
ALTER COLUMN "contentDate" SET DEFAULT CURRENT_DATE;

ALTER TABLE "reading_materials"
ADD COLUMN "contentDate" DATE,
ADD COLUMN "showDate" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
ADD COLUMN "isArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "sourceMediaId" INTEGER;

UPDATE "reading_materials"
SET "contentDate" = "createdAt"::date;

ALTER TABLE "reading_materials"
ALTER COLUMN "contentDate" SET NOT NULL,
ALTER COLUMN "contentDate" SET DEFAULT CURRENT_DATE;

CREATE UNIQUE INDEX "reading_materials_sourceMediaId_key"
ON "reading_materials"("sourceMediaId");
