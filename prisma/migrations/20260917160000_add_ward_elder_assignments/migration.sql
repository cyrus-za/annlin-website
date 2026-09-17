ALTER TABLE "wards" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1;

CREATE TABLE "ward_elder_assignments" (
    "id" TEXT NOT NULL,
    "wardId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ward_elder_assignments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ward_elder_assignments_wardId_endDate_idx" ON "ward_elder_assignments"("wardId", "endDate");
CREATE INDEX "ward_elder_assignments_memberId_endDate_idx" ON "ward_elder_assignments"("memberId", "endDate");

ALTER TABLE "ward_elder_assignments"
  ADD CONSTRAINT "ward_elder_assignments_wardId_fkey" FOREIGN KEY ("wardId") REFERENCES "wards"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "ward_elder_assignments_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "ward_elder_assignments_valid_dates" CHECK ("endDate" IS NULL OR "endDate" > "startDate"),
  ADD CONSTRAINT "ward_elder_assignments_ward_no_overlap" EXCLUDE USING gist (
    "wardId" WITH =,
    daterange("startDate", COALESCE("endDate", 'infinity'::date), '[)') WITH &&
  ),
  ADD CONSTRAINT "ward_elder_assignments_member_no_overlap" EXCLUDE USING gist (
    "memberId" WITH =,
    daterange("startDate", COALESCE("endDate", 'infinity'::date), '[)') WITH &&
  );
