ALTER TABLE "users" ADD COLUMN "disabledAt" TIMESTAMP(3);

CREATE TYPE "MemberCapability" AS ENUM (
  'MEMBER_ACCESS_ADMIN',
  'MEMBER_READ',
  'MEMBER_WRITE',
  'HOUSEHOLD_WRITE',
  'WARD_WRITE',
  'MEMBER_EXPORT',
  'MEMBER_IMPORT_PREVIEW',
  'MEMBER_AUDIT_READ'
);

CREATE TABLE "member_pilot_access" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "grantedById" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "member_pilot_access_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "member_capability_grants" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "capability" "MemberCapability" NOT NULL,
  "grantedById" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "member_capability_grants_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "member_pilot_access_userId_key" ON "member_pilot_access"("userId");
CREATE INDEX "member_pilot_access_expiresAt_idx" ON "member_pilot_access"("expiresAt");
CREATE UNIQUE INDEX "member_capability_grants_userId_capability_key" ON "member_capability_grants"("userId", "capability");
CREATE INDEX "member_capability_grants_capability_expiresAt_idx" ON "member_capability_grants"("capability", "expiresAt");

ALTER TABLE "member_pilot_access"
  ADD CONSTRAINT "member_pilot_access_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "member_pilot_access_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "member_capability_grants"
  ADD CONSTRAINT "member_capability_grants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "member_capability_grants_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
