# Repository Guidance

- Do not run local `next build`, `next dev`, `tsc`, or other memory-heavy Node processes on this host. Let Vercel build deployments and perform longer QA against production.
- Lightweight import, audit, and database scripts may be run locally when needed.
- Never print environment-file contents or credential values.
- After every user-facing commit pushed to `main`, add a concise Afrikaans entry to the admin Veranderingslogboek with `npm run changelog:add -- --title="..." --description="..." --category="..." --commit=<full-sha>`.
- Do not add developer-only work to the Veranderingslogboek. Exclude hooks, tests, refactors, build fixes, deployment plumbing, internal documentation, audits, and migrations unless they create a change administrators can directly use or need to know about.
- Run `npm run hooks:install` once per checkout so the versioned post-commit reminder remains active.
- Preserve unrelated worktree changes. In particular, do not include planning documents or user edits in a commit unless they belong to the current task.
