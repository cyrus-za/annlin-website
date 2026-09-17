-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DEPARTED', 'DECEASED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MemberContactType" AS ENUM ('MOBILE', 'PHONE', 'EMAIL', 'WHATSAPP', 'OTHER');

-- CreateEnum
CREATE TYPE "HouseholdRole" AS ENUM ('HEAD', 'SPOUSE', 'CHILD', 'DEPENDANT', 'OTHER');

-- CreateEnum
CREATE TYPE "MembershipEventType" AS ENUM ('ARRIVAL', 'BAPTISM', 'PROFESSION', 'CERTIFICATE_REQUESTED', 'CERTIFICATE_RECEIVED', 'DEPARTURE', 'RETURNED', 'DEATH', 'STATUS_CHANGED', 'OTHER');

-- CreateEnum
CREATE TYPE "MemberAccessScope" AS ENUM ('GLOBAL', 'WARDS');

-- AlterTable
ALTER TABLE "member_capability_grants"
  ADD COLUMN "scope" "MemberAccessScope" NOT NULL DEFAULT 'WARDS';

-- CreateTable
CREATE TABLE "member_ward_scopes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wardId" TEXT NOT NULL,
    "grantedById" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_ward_scopes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL,
    "firstNames" TEXT NOT NULL,
    "preferredName" TEXT,
    "lastName" TEXT NOT NULL,
    "birthDate" DATE,
    "status" "MemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "version" INTEGER NOT NULL DEFAULT 1,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "households" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "households_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "household_members" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "role" "HouseholdRole" NOT NULL DEFAULT 'OTHER',
    "isHead" BOOLEAN NOT NULL DEFAULT false,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "household_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "household_addresses" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "suburb" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "countryCode" TEXT NOT NULL DEFAULT 'ZA',
    "normalized" TEXT,
    "source" TEXT,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "household_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_contact_points" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "type" "MemberContactType" NOT NULL,
    "value" TEXT NOT NULL,
    "normalizedValue" TEXT NOT NULL,
    "isPreferred" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_contact_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wards" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "activeFrom" DATE NOT NULL,
    "activeTo" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ward_assignments" (
    "id" TEXT NOT NULL,
    "memberId" TEXT,
    "householdId" TEXT,
    "wardId" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ward_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership_events" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "type" "MembershipEventType" NOT NULL,
    "effectiveDate" DATE NOT NULL,
    "details" JSONB,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "membership_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_source_records" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "sourceSystem" TEXT NOT NULL,
    "sourceRecordId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "sourceHash" TEXT NOT NULL,
    "comparison" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_source_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_audit_events" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actorId" TEXT,
    "actorNameSnapshot" TEXT NOT NULL,
    "actorRoleSnapshot" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "changes" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "member_audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_subjects" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "memberId" TEXT,
    "householdId" TEXT,
    "wardId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "member_ward_scopes_wardId_expiresAt_idx" ON "member_ward_scopes"("wardId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "member_ward_scopes_userId_wardId_key" ON "member_ward_scopes"("userId", "wardId");

-- CreateIndex
CREATE INDEX "members_lastName_firstNames_idx" ON "members"("lastName", "firstNames");

-- CreateIndex
CREATE INDEX "members_status_archivedAt_idx" ON "members"("status", "archivedAt");

-- CreateIndex
CREATE INDEX "households_name_idx" ON "households"("name");

-- CreateIndex
CREATE INDEX "households_archivedAt_idx" ON "households"("archivedAt");

-- CreateIndex
CREATE INDEX "household_members_householdId_endDate_idx" ON "household_members"("householdId", "endDate");

-- CreateIndex
CREATE INDEX "household_members_memberId_endDate_idx" ON "household_members"("memberId", "endDate");

-- CreateIndex
CREATE INDEX "household_addresses_householdId_endDate_idx" ON "household_addresses"("householdId", "endDate");

-- CreateIndex
CREATE INDEX "household_addresses_normalized_idx" ON "household_addresses"("normalized");

-- CreateIndex
CREATE INDEX "member_contact_points_memberId_endDate_idx" ON "member_contact_points"("memberId", "endDate");

-- CreateIndex
CREATE INDEX "member_contact_points_type_normalizedValue_idx" ON "member_contact_points"("type", "normalizedValue");

-- CreateIndex
CREATE UNIQUE INDEX "wards_code_key" ON "wards"("code");

-- CreateIndex
CREATE INDEX "wards_activeTo_idx" ON "wards"("activeTo");

-- CreateIndex
CREATE INDEX "ward_assignments_memberId_endDate_idx" ON "ward_assignments"("memberId", "endDate");

-- CreateIndex
CREATE INDEX "ward_assignments_householdId_endDate_idx" ON "ward_assignments"("householdId", "endDate");

-- CreateIndex
CREATE INDEX "ward_assignments_wardId_endDate_idx" ON "ward_assignments"("wardId", "endDate");

-- CreateIndex
CREATE INDEX "membership_events_memberId_effectiveDate_idx" ON "membership_events"("memberId", "effectiveDate");

-- CreateIndex
CREATE INDEX "member_source_records_batchId_idx" ON "member_source_records"("batchId");

-- CreateIndex
CREATE INDEX "member_source_records_memberId_idx" ON "member_source_records"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "member_source_records_sourceSystem_sourceRecordId_key" ON "member_source_records"("sourceSystem", "sourceRecordId");

-- CreateIndex
CREATE INDEX "member_audit_events_entityType_entityId_createdAt_idx" ON "member_audit_events"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "member_audit_events_actorId_createdAt_idx" ON "member_audit_events"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "task_subjects_taskId_idx" ON "task_subjects"("taskId");

-- CreateIndex
CREATE INDEX "task_subjects_memberId_idx" ON "task_subjects"("memberId");

-- CreateIndex
CREATE INDEX "task_subjects_householdId_idx" ON "task_subjects"("householdId");

-- CreateIndex
CREATE INDEX "task_subjects_wardId_idx" ON "task_subjects"("wardId");

-- AddForeignKey
ALTER TABLE "member_ward_scopes" ADD CONSTRAINT "member_ward_scopes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_ward_scopes" ADD CONSTRAINT "member_ward_scopes_wardId_fkey" FOREIGN KEY ("wardId") REFERENCES "wards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_ward_scopes" ADD CONSTRAINT "member_ward_scopes_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "household_members" ADD CONSTRAINT "household_members_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "household_members" ADD CONSTRAINT "household_members_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "household_addresses" ADD CONSTRAINT "household_addresses_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_contact_points" ADD CONSTRAINT "member_contact_points_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ward_assignments" ADD CONSTRAINT "ward_assignments_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ward_assignments" ADD CONSTRAINT "ward_assignments_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ward_assignments" ADD CONSTRAINT "ward_assignments_wardId_fkey" FOREIGN KEY ("wardId") REFERENCES "wards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_events" ADD CONSTRAINT "membership_events_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_source_records" ADD CONSTRAINT "member_source_records_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_audit_events" ADD CONSTRAINT "member_audit_events_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_subjects" ADD CONSTRAINT "task_subjects_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_subjects" ADD CONSTRAINT "task_subjects_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_subjects" ADD CONSTRAINT "task_subjects_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_subjects" ADD CONSTRAINT "task_subjects_wardId_fkey" FOREIGN KEY ("wardId") REFERENCES "wards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Domain invariants not expressible in Prisma's schema language.
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "household_members"
  ADD CONSTRAINT "household_members_valid_dates" CHECK ("endDate" IS NULL OR "endDate" > "startDate"),
  ADD CONSTRAINT "household_members_no_overlap" EXCLUDE USING gist (
    "memberId" WITH =,
    daterange("startDate", COALESCE("endDate", 'infinity'::date), '[)') WITH &&
  );

ALTER TABLE "household_addresses"
  ADD CONSTRAINT "household_addresses_valid_dates" CHECK ("endDate" IS NULL OR "endDate" > "startDate"),
  ADD CONSTRAINT "household_addresses_no_overlap" EXCLUDE USING gist (
    "householdId" WITH =,
    daterange("startDate", COALESCE("endDate", 'infinity'::date), '[)') WITH &&
  );

ALTER TABLE "member_contact_points"
  ADD CONSTRAINT "member_contact_points_valid_dates" CHECK ("endDate" IS NULL OR "endDate" > "startDate");

ALTER TABLE "wards"
  ADD CONSTRAINT "wards_valid_dates" CHECK ("activeTo" IS NULL OR "activeTo" > "activeFrom");

ALTER TABLE "ward_assignments"
  ADD CONSTRAINT "ward_assignments_exactly_one_subject" CHECK (
    (("memberId" IS NOT NULL)::int + ("householdId" IS NOT NULL)::int) = 1
  ),
  ADD CONSTRAINT "ward_assignments_valid_dates" CHECK ("endDate" IS NULL OR "endDate" > "startDate"),
  ADD CONSTRAINT "ward_assignments_member_no_overlap" EXCLUDE USING gist (
    "memberId" WITH =,
    daterange("startDate", COALESCE("endDate", 'infinity'::date), '[)') WITH &&
  ) WHERE ("memberId" IS NOT NULL),
  ADD CONSTRAINT "ward_assignments_household_no_overlap" EXCLUDE USING gist (
    "householdId" WITH =,
    daterange("startDate", COALESCE("endDate", 'infinity'::date), '[)') WITH &&
  ) WHERE ("householdId" IS NOT NULL);

ALTER TABLE "task_subjects"
  ADD CONSTRAINT "task_subjects_exactly_one_subject" CHECK (
    (("memberId" IS NOT NULL)::int + ("householdId" IS NOT NULL)::int + ("wardId" IS NOT NULL)::int) = 1
  );

CREATE UNIQUE INDEX "household_members_current_head_key"
  ON "household_members"("householdId") WHERE "endDate" IS NULL AND "isHead" = true;
CREATE UNIQUE INDEX "task_subjects_task_member_key"
  ON "task_subjects"("taskId", "memberId") WHERE "memberId" IS NOT NULL;
CREATE UNIQUE INDEX "task_subjects_task_household_key"
  ON "task_subjects"("taskId", "householdId") WHERE "householdId" IS NOT NULL;
CREATE UNIQUE INDEX "task_subjects_task_ward_key"
  ON "task_subjects"("taskId", "wardId") WHERE "wardId" IS NOT NULL;

CREATE FUNCTION prevent_member_audit_mutation() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'member audit events are append-only';
END;
$$;

CREATE TRIGGER "member_audit_events_append_only"
BEFORE UPDATE OR DELETE ON "member_audit_events"
FOR EACH ROW EXECUTE FUNCTION prevent_member_audit_mutation();
