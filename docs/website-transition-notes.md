# Website Transition Notes

Last updated: 2026-08-06

## Confirmed from the live WordPress site

- The public homepage currently groups service groups into:
  - `Diensgroepe onder leiding van die Diakonie`
  - `Ander diensgroepe`
- The WordPress contact page confirms:
  - Kerkkantoor landlyn: `012 567 1492`
  - Selfoonnommer: `079 162 3453`
  - Kerkkantoor e-pos: `kerkkantoor@annlin.co.za`
  - Kantoorure: `08:00 tot 16:00`, Maandag tot Vrydag
  - Physical location is the church at `H/v Braam Pretoriusstraat en Kaneelbaslaan, Wonderboom, Pretoria`
- The WordPress page with slug `nuus-2025` was titled `Nuus 2026`.
  - Verified against the public WP REST API on `2026-07-06`
  - WP metadata returned:
    - `slug`: `nuus-2025`
    - `title`: `Nuus 2026`
    - `modified`: `2026-07-03T12:00:33`
  - The annual pages were mutable index containers rather than individual news stories.
  - Their stories now have first-class article records. `/nuus/nuus-2021` through
    `/nuus/nuus-2026` permanently redirect to `/nuus`.
- On `2026-08-06`, `annlin.co.za` stopped serving WordPress and began returning an Apache
  `This domain is temporarily unavailable` placeholder. The REST API now returns that HTML
  placeholder, and `www.annlin.co.za` does not resolve. This was observed, not performed by
  this migration process.
- WordPress service-group pages expose these named contacts publicly:
  - `Jeug`: Lisa Vosloo, oudl. Thomas Venter, Zoë Venter, Clarissa Rehder
  - `Gebedsgroep`: Carina Pyper
  - `Terebinte`: oudl. Hannes Venter
  - `Susters`: Magda du Toit
  - `Sekuriteit`: oudl. Jan Rehder
  - `Vroue Bedieningsgroep`: Anne-Marie (the page copy does not state a surname)

## Unresolved items to confirm in the meeting

- `Kerkraad Voorsitter`
  - No clear public name was found in the WordPress contact page or quick public page searches.
  - The placeholder name was removed from the new site to avoid publishing incorrect information.
- `Administrateur`
  - No named administrator was exposed on the public WordPress contact page.
  - The new site currently routes administrative contact through the kerkkantoor instead.
- Postal address
  - The previous new-site placeholder postal address was not sourced from WordPress.
  - It was removed from the public page pending confirmation.
- Service-group contact people not named clearly on public WordPress pages:
  - `Siekebesoeke`
  - `Seniors`
  - `Sosiale Dienste`
  - `Tradisionele Dienste`
  - `Versorging en Barmhartigheid`
  - `Vervoer`
  - `Verwelkoming en Gasvryheid`
  - `Evangelisasie`
  - `Tweedehandse Goedere Verkoping`
  - `Fontein Redaksie`
  - Until confirmed, unnamed Diakonie service groups are routed through `Diakonie`; other unnamed groups remain routed through the kerkkantoor.

## Migration audit summary

Audit run against:

- WordPress: `https://annlin.co.za`
- New site: `https://annlin.venter.pro`

Final source-connected results on `2026-08-05`:

- WordPress pages checked: `48`
- Active service groups migrated: `16 / 16`
- WordPress news-container pages accounted for: `8 / 8`
  - The annual `Nuus 2021` through `Nuus 2026` pages were mutable containers, not individual news articles.
  - Five annual containers are retained internally as `ARCHIVED` and no longer appear as public articles.
  - `40` historical stories were extracted from the annual containers into first-class articles.
  - The database contains `42` published news stories in total and `5` archived annual containers.
- Events retained in the new database: `72`
  - The current WordPress events API returned `50`; all `50` are present. The other `22` are retained historical events.
- WordPress media items independently archived to Cloudflare R2: `597 / 597`
  - The live WordPress library grew from the original `587` count to `597` items before the latest final run.
  - `UploadedAsset` inventory rows: `597`
  - Total archived bytes copied or confirmed in R2: `1,048,649,457`
  - WordPress media entries with known source sizes account for `944,379,617` bytes.
  - WordPress media entries without source size metadata: `219`
- Public routes crawled on the deployed site: `329`
  - The final `2026-08-06` crawl seeds from the generated sitemap as well as navigable links,
    so paginated publication detail pages are covered even when their cards are not on the
    currently visible library page.
- Broken public pages: `0`
- Public request or route-discovery failures: `0`
- Redirect failures for legacy slugs: `0`
- Links back to old WordPress pages: `0`
- Links back to old WordPress media URLs: `0`
- Remaining old-domain data references in migrated records: `0`
- The final resumable run copied the five newly discovered objects, skipped the `592` already completed objects, and ended with `failed: 0`.
- Independent archive accounting: `597 / 597` WordPress media items have matching `UploadedAsset` rows and R2 object keys.
- The expanded route/media audit reports `wordpressOfflineReady: true` after also checking
  retired Reading indexes, independent publication records, annual News redirects and source
  documents. One linked historical pre-summary PDF was already `404` at its WordPress source
  and could not be recovered.

## Publication-library migration

The WordPress media library contained `249` document or audio objects in addition to images. Archiving the objects to R2 did not by itself make those publications discoverable on the new site.

Semantic import result on `2026-08-05`:

- Source document/audio objects: `249`
- Canonical public or historical records: `239`
- Duplicate Maandblad variants omitted from the public catalogue: `10`
  - Each duplicated issue keeps one public record, preferring its web-optimized PDF.
  - The alternate binary remains safely retained in the independent R2 inventory.
- Die Fontein Weekblaaie: `87`
- Die Fontein Maandblaaie: `21` canonical issues
- Liturgie: `31`
- Preeksamevattings: `11`
- Kinderwerk: `33`
- Oordenkingsklank: `5`
- Jaarprogramdokumente: `12`
- Uitreikmateriaal: `15`
- Algemene dokumente: `24`
- Publication records with valid metadata: `239 / 239`
- Publication records with successful, size-consistent R2 responses: `239 / 239`
- Missing publication records: `0`
- Invalid publication records: `0`
- Publication/article records containing temporary migration-context wording: `0`

The public information architecture treats `Nuus` as dated articles plus the latest Weekblad, Maandblad and liturgy. The expanded `Leesstof en publikasies` library provides search, collection/year filters, editorial-date sorting and pagination. Historical archive-only records remain visible to administrators rather than appearing in the public library.

The imported catalogue now uses stable publication names instead of WordPress filename workarounds. Week- and month dates live only in `contentDate`; Liturgie and preeksamevatting records use subject headings recovered from their PDFs; and category badges use distinct icons and colours. PDF detail pages provide a larger embedded reader with the browser's page controls, plus prominent open/download actions for mobile users.

All news and resource ordering uses the required editorial `contentDate`. Technical `createdAt`, `updatedAt` and workflow `publishedAt` values are not used as public dates.

## Inline WordPress assets audit

The WordPress pages include inline assets in normal HTML and in Divi shortcodes such as
`[et_pb_image src="..."]`. These were easy to lose when converting WordPress pages into
plain text content.

Audit result before the shortcode parser fix:

- WordPress pages with inline images or linked files: `31`
- Missing rendered asset references in migrated content: `32`
- Pages affected:
  - `nuus-2023`: `DXF.png`, `Picture-Collage-Save-the-Date-Card.png`
  - `nuus-2022`: `Die-Fontein-3-scaled.jpg`
  - `nuus-2021`: `Nuusbrief-e1558790613843.jpeg`
  - `katkisasie-fotoblad`: `Boodskap-aan-jeug.jpg`, `Fotoblad-katkisasiekamp-2019.jpg`
  - `jaarprogram`: `2026-Jaarprogram-6.pdf`, `2026-Jaarprogram-7.pdf`
  - `oor-annlin-gemeente`: `cross-671379_960_720-e1538205832755.jpg`, `Diensterreine.jpg`, `Ds-Pieter-Kurpershoek-en-Marietjie.jpeg`, `Logo-GK-Annlin.png`, `Bybel.png`
  - `homepagenew`: WordPress homepage service-group icons plus current homepage bulletin images.

Source fix added on `2026-07-06`:

- The WordPress importer now preserves real `<img>` tags, linked files, and Divi image
  shortcodes as markdown images/links.
- The Leesstof detail page renders preserved markdown links/images instead of plain text.
- The inline-asset audit now detects Divi image shortcodes and scans `public/migrated`
  dynamically.

Final source-connected verification on `2026-08-05`:

- WordPress pages with inline images or linked files: `31`
- Raw rendered-reference differences: `39`
  - These include custom singleton redesigns, retired WordPress index pages and files already
    unavailable at their WordPress source; the raw count is retained for diagnostic context.
- Required rendered assets missing from the new site: `0`
- Assets still available only from WordPress: `0`
- Source asset references already returning `404` or `410` on WordPress: `8`
- Redesigned singleton pages with expected source differences: `3`
  - These are intentionally custom implementations rather than copied WordPress bodies.
- Raw page-level asset references not matched to the independent archive: `25`
- The updated `Jeug` WordPress page contained `24` images referenced only through Divi gallery media IDs. The importer now resolves those IDs through the WordPress media API and preserves the gallery as markdown images.
  - The targeted Jeug sync and resumable R2 rewrite finished with `597 / 597` inventoried, `597` existing objects skipped, `failed: 0`, and one record rewritten.
  - Production renders all `24` gallery images from R2 with successful responses and no console errors.
- The remaining historical inline-asset mismatches are not live broken links or WordPress dependencies on the new site:
  - `susters-saamtrek-2024`, `nuus-2023`, `nuus-2022`, `nuus-2021`, and `preke-op-skrif` still reference source-only WordPress files that now return `404` on WordPress and were therefore removed from migrated public content.
  - `kinderwerkkaarte` and the other retired Reading indexes were replaced by independent,
    filterable publication records. Their source documents are accounted for except for the
    already-unavailable pre-summary PDF noted above.
  - The singleton pages `homepagenew`, `oor-annlin-gemeente`, and `jaarprogram` are deliberate custom builds rather than mirrored WordPress bodies.
- The text-coverage audit still reports `10` low-scoring records. Manual checks confirmed that its strongest outliers are expected normalization differences:
  - `Pinksterfeesvieringe 4 & 5 Junie 2022` preserves the source event image but omits the
    expired WordPress RSVP form.
  - `Fontein Redaksie` preserves the source's substantive status text, `Webblad onder konstruksie`.
- `npm run content:test` passes.

## WordPress shutdown status

- The WordPress binary-media archive blocker is cleared.
- The first-class content and publication discovery blocker is cleared.
- Technical evidence through `2026-08-05`:
  - `scripts/import-wordpress-media.ts` completed with `failed: 0`
  - `inventoried: 597`
  - `copiedToStorage + skippedExistingStorage = 597`
  - `scripts/audit-wordpress-migration.ts` reports `migratedMediaAssets: 597`, `missingMedia: 0`, and `oldDomainRows: 0`
  - The expanded route/media audit against production reports `missingContent: 0`,
    `missingRetiredReadingIndexes: 0`, `missingEvents: 0`, `badRoutes: 0`,
    `badRedirects: 0`, and `wordpressOfflineReady: true`.
  - The deployed public crawl reports `brokenPages: 0`, `requestFailures: 0`, `seedFailures: 0`, `legacyPageLinks: 0`, and `legacyMediaLinks: 0`
  - The deployed sitemap-driven crawl visited `329` routes without hitting its `500`-route limit
  - All `597` current WordPress media items are independently inventoried in R2
  - gstack browser QA confirmed the deployed `Leesstof en publikasies` library and active Google Play and Apple App Store links. A mobile publication-card overflow found during QA was fixed; the final `375px` viewport measures `375px` document width with no console errors.
- Caveat:
  - The text comparison still reports `10` low-similarity warnings caused by intentional editorial, normalization, and redesign differences. All corresponding records are present, so these are not WordPress runtime dependencies.
  - The first-class publication library is deployed and production-crawled, with `239 / 239` canonical records and successful R2 responses.
  - The publication semantic audit reports `invalidRecords: 0` and `migrationContextRecords: 0` after title and description cleanup.
  - The inline-asset audit reports `missingRequiredRenderedAssets: 0` and
    `assetsAvailableOnlyOnWordPress: 0`; there are no current Jeug gallery differences.
- Remaining operational blocker:
  - Direct future R2 uploads from admin require deployment of the signed upload Worker.
  - Vercel Production has `R2_BUCKET_NAME` and `R2_PUBLIC_BASE_URL`, but does not yet have
    `R2_UPLOAD_WORKER_URL` or `R2_UPLOAD_SECRET`.
  - The current scoped Cloudflare API token identifies the GK Annlin account and manages R2,
    but a Worker deployment lookup fails with Cloudflare authentication error `10000`; it needs
    the narrowly scoped Workers permission before the Worker can be deployed.
  - The checked-in Worker configuration already allows the temporary hostname plus both final
    `annlin.co.za` hostname variants, so the approved DNS cutover will not require a CORS code change.
- Current external state on `2026-08-06`:
  - WordPress is already unavailable at `annlin.co.za`, independently of this migration.
  - `annlin.venter.pro` remains the verified working production site.
  - No DNS/domain switch was performed by this migration process.

## Practical implication

- The structured pages, service groups, events, binary media archive and first-class publication records are migrated in the database.
- The migrated public site is independent of WordPress for its current content and media, and
  the final source-connected audits found no recoverable content or asset that exists only on
  WordPress.
- Do not approve the permanent shutdown/domain cutover as operationally complete until the
  direct admin R2 upload path is working and an authenticated upload has been verified end to end.
- Because the old domain is already unavailable, the hosting/DNS owner should urgently decide
  whether to restore WordPress temporarily or approve routing `annlin.co.za` to the new site.
  Pieter retains the final decision; Codex must not make that DNS change autonomously.

## Approved domain cutover checklist

1. Grant the scoped Cloudflare token `Workers Scripts: Edit`, deploy
   `annlin-media-upload`, configure `R2_UPLOAD_WORKER_URL` and `R2_UPLOAD_SECRET` in Vercel,
   and complete an authenticated admin upload to R2.
2. Obtain Pieter and the communication commission's explicit approval for the production
   domain change.
3. Add `annlin.co.za` and `www.annlin.co.za` to the existing Vercel project and use Vercel's
   current project-specific DNS instructions. Prefer `https://annlin.co.za` as the canonical
   public hostname and redirect `www` to it.
4. Change only the apex/`www` web records. Preserve the current MX record, the `mail` host and
   all SPF, DKIM and DMARC records so church email is not interrupted.
5. Set Vercel Production `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` to the approved canonical
   final origin, then trigger and verify a fresh production deployment. Auth already trusts the
   temporary hostname and both final hostname variants during the transition.
6. Verify HTTPS, apex/`www` redirects, admin sign-in, password reset, invitation links, contact
   notifications, R2 upload, `robots.txt`, `sitemap.xml`, PDFs/audio/images and the complete
   public crawl on the final hostname.
7. Monitor Vercel, Neon, Resend and R2 errors after cutover. Retain rollback access to the old
   DNS values until the agreed monitoring period has passed.
