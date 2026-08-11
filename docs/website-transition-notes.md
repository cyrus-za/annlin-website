# Website Transition Notes

Last updated: 2026-08-11

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
  - Their stories now have first-class library records. `/nuus/nuus-2021` through
    `/nuus/nuus-2026` permanently redirect to `/nuus`.
- On `2026-08-06`, `annlin.co.za` temporarily stopped serving WordPress and returned an Apache
  `This domain is temporarily unavailable` placeholder. This was observed, not performed by
  this migration process. The WordPress site and REST API were reachable again on `2026-08-11`.
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

Latest source-connected results on `2026-08-11`:

- WordPress pages checked: `48`
- Active service groups migrated: `16 / 16`
- WordPress news-container pages accounted for: `8 / 8`
  - The annual `Nuus 2021` through `Nuus 2026` pages were mutable containers, not individual news articles.
  - Five annual containers are retained internally as `ARCHIVED` and no longer appear as public articles.
  - Historical stories extracted from those containers are retained in the public library; the
    WordPress-derived source article records are archived and do not compete with current News.
- Events retained in the new database: `79`
  - The current WordPress events API returned `50`; all `50` are present. The other `29` are retained historical events.
- WordPress media items independently archived to Cloudflare R2: `606 / 606`
  - The live WordPress library grew from the original `587` count to `597`, then to `606` by
    `2026-08-11`.
  - `UploadedAsset` inventory rows: `606`
  - Total archived bytes copied or confirmed in R2: `1,062,578,856`
  - WordPress media entries with known source sizes account for `958,309,016` bytes.
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
- The `2026-08-11` incremental refresh discovered and archived `9` new objects: seven Fontein
  cover images, the Weekblad for 9 August 2026 and the Liturgie for 9 August 2026.
- Independent HTTP verification returned `200` for all nine new R2 objects and matched every
  response `Content-Length` to its `UploadedAsset.size`.
- Independent archive accounting: `606 / 606` WordPress media items have matching `UploadedAsset` rows and R2 object keys.
- The expanded route/media audit reports `wordpressOfflineReady: true` after also checking
  retired Reading indexes, independent publication records, annual News redirects and source
  documents. One linked historical pre-summary PDF was already `404` at its WordPress source
  and could not be recovered.

## Publication-library migration

The WordPress media library now contains `251` document or audio objects in addition to images. Archiving the objects to R2 did not by itself make those publications discoverable on the new site.

Semantic import result on `2026-08-11`:

- Source document/audio objects: `251`
- Canonical public or historical records: `241`
- Duplicate Maandblad variants omitted from the public catalogue: `10`
  - Each duplicated issue keeps one public record, preferring its web-optimized PDF.
  - The alternate binary remains safely retained in the independent R2 inventory.
- Die Fontein Weekblaaie: `88`
- Die Fontein Maandblaaie: `21` canonical issues
- Liturgie: `32`
- Preeksamevattings: `11`
- Kinderwerk: `33`
- Oordenkingsklank: `5`
- Jaarprogramdokumente: `12`
- Uitreikmateriaal: `15`
- Algemene dokumente: `24`
- Publication records with valid metadata: `241 / 241`
- Publication records with successful, size-consistent R2 responses: `241 / 241`
- Missing publication records: `0`
- Invalid publication records: `0`
- Publication/article records containing temporary migration-context wording: `0`

The public information architecture keeps `Nuus` focused on only the latest Weekblad and
Maandblad. The expanded `Leesstof en publikasies` library contains the full publication history,
historical gemeentenuus and other resources with search, collection/year filters,
editorial-date sorting and pagination. Historical archive-only records remain visible to
administrators rather than appearing in the public library.

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

Latest source-connected verification on `2026-08-11`:

- WordPress pages with inline images or linked files: `32`
- Raw rendered-reference differences: `39`
  - These include custom singleton redesigns, retired WordPress index pages and files already
    unavailable at their WordPress source; the raw count is retained for diagnostic context.
- Required rendered assets missing from the new site: `0`
- Assets still available only from WordPress: `0`
- Source asset references already returning `404` or `410` on WordPress: `8`
- Redesigned singleton pages with expected source differences: `2`
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
- The text-coverage audit reports `11` low-scoring records. Manual checks confirmed that its strongest outliers are expected normalization differences:
  - `Pinksterfeesvieringe 4 & 5 Junie 2022` preserves the source event image but omits the
    expired WordPress RSVP form.
  - `Fontein Redaksie` now preserves the source's seven linked 2026 issue covers and their
    publication links, all rewritten to R2; the score reflects image/link normalization rather
    than missing content.
- `npm run content:test` passes.

## WordPress shutdown status

- The WordPress binary-media archive blocker is cleared.
- The first-class content and publication discovery blocker is cleared.
- Technical evidence through `2026-08-11`:
  - `scripts/import-wordpress-media.ts` completed with `failed: 0`
  - The previous complete resumable run ended with `failed: 0`; the subsequent incremental
    refresh independently verified every new object and inventory row.
  - `scripts/audit-wordpress-migration.ts` reports `migratedMediaAssets: 606`, `missingMedia: 0`, and `oldDomainRows: 0`
  - The expanded route/media audit against production reports `missingContent: 0`,
    `missingRetiredReadingIndexes: 0`, `missingEvents: 0`, `badRoutes: 0`,
    `badRedirects: 0`, and `wordpressOfflineReady: true`.
  - The deployed public crawl reports `brokenPages: 0`, `requestFailures: 0`, `seedFailures: 0`, `legacyPageLinks: 0`, and `legacyMediaLinks: 0`
  - The deployed sitemap-driven crawl visited `329` routes without hitting its `500`-route limit
  - All `606` current WordPress media items are independently inventoried in R2
  - gstack browser QA confirmed the deployed `Leesstof en publikasies` library and active Google Play and Apple App Store links. A mobile publication-card overflow found during QA was fixed; the final `375px` viewport measures `375px` document width with no console errors.
- Caveat:
  - The text comparison reports `11` low-similarity warnings caused by intentional editorial, normalization, and redesign differences. All corresponding records are present, so these are not WordPress runtime dependencies.
  - The first-class publication library contains `241 / 241` canonical records with successful R2 responses.
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
- Current external state on `2026-08-11`:
  - WordPress and its REST API are reachable again at `annlin.co.za`.
  - `annlin.venter.pro` remains the verified working production site.
  - No DNS/domain switch was performed by this migration process.

## Practical implication

- The structured pages, service groups, events, binary media archive and first-class publication records are migrated in the database.
- The migrated public site is independent of WordPress for its current content and media, and
  the final source-connected audits found no recoverable content or asset that exists only on
  WordPress.
- Do not approve the permanent shutdown/domain cutover as operationally complete until the
  direct admin R2 upload path is working and an authenticated upload has been verified end to end.
- Pieter and the communication commission retain the final WordPress shutdown and DNS decision;
  Codex must not make that change autonomously.

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
