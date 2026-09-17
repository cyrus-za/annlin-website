DROP INDEX IF EXISTS "changelog_entries_commitSha_key";

CREATE UNIQUE INDEX IF NOT EXISTS "changelog_entries_commitSha_title_key"
ON "changelog_entries"("commitSha", "title");
