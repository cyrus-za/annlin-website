# Website Transition Notes

Last updated: 2026-08-05

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
- The WordPress page with slug `nuus-2025` is currently titled `Nuus 2026`.
  - Verified against the public WP REST API on `2026-07-06`
  - WP metadata returned:
    - `slug`: `nuus-2025`
    - `title`: `Nuus 2026`
    - `modified`: `2026-07-03T12:00:33`
  - The new site publishes this page at the canonical route `/nuus/nuus-2026`.
  - `/nuus/nuus-2025` permanently redirects to the canonical route.
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

Results on `2026-08-04`:

- WordPress pages checked: `48`
- Active service groups migrated: `16 / 16`
- WordPress news-container pages accounted for: `8 / 8`
  - The annual `Nuus 2021` through `Nuus 2026` pages were mutable containers, not individual news articles.
  - Five annual containers are retained internally as `ARCHIVED` and no longer appear as public articles.
- Events retained in the new database: `72`
  - The current WordPress events API returned `50`; all `50` are present. The other `22` are retained historical events.
- WordPress media items independently archived to Cloudflare R2: `597 / 597`
  - The live WordPress library grew from the original `587` count to `597` items before the latest final run.
  - `UploadedAsset` inventory rows: `597`
  - Total archived bytes copied or confirmed in R2: `1,048,649,457`
  - WordPress media entries with known source sizes account for `944,379,617` bytes.
  - WordPress media entries without source size metadata: `219`
- Public pages crawled on the deployed site: `49`
- Broken public pages: `0`
- Public request or route-discovery failures: `0`
- Redirect failures for legacy slugs: `0`
- Links back to old WordPress pages: `0`
- Links back to old WordPress media URLs: `0`
- Remaining old-domain data references in migrated records: `0`
- The final resumable run copied the five newly discovered objects, skipped the `592` already completed objects, and ended with `failed: 0`.
- Independent archive accounting: `597 / 597` WordPress media items have matching `UploadedAsset` rows and R2 object keys.
- The original route/media audit result was `wordpressOfflineReady: true`, but this did not test whether documents embedded in mutable WordPress pages had first-class public records. The shutdown conclusion was reopened on `2026-08-05` for a semantic publication audit.

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

The public information architecture treats `Nuus` as dated articles plus the latest Weekblad, Maandblad and liturgy. The expanded `Leesstof en publikasies` library provides search, collection/year filters, editorial-date sorting, pagination and an opt-in historical archive.

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

Verification on `2026-08-05`:

- WordPress pages with inline images or linked files: `31`
- Migrated pages with missing rendered asset references in the comparison audit: `7`
- Missing migrated asset references in the comparison audit: `33`
- Redesigned singleton pages with expected source differences: `3`
  - These are intentionally custom implementations rather than copied WordPress bodies.
- WordPress page-level asset references not yet present in the independent media archive: `25`
- One current-content difference still needs migration before WordPress shutdown:
  - The updated `Jeug` WordPress page contains `24` gallery images which are present in R2 but are not yet rendered in the new service-group content.
- The remaining historical inline-asset mismatches are not live broken links on the new site:
  - `susters-saamtrek-2024`, `nuus-2023`, `nuus-2022`, `nuus-2021`, and `preke-op-skrif` still reference source-only WordPress files that now return `404` on WordPress and were therefore removed from migrated public content.
  - `kinderwerkkaarte` still differs by one historical PDF link that is not in the independent archive, but the page no longer publishes old-domain URLs.
  - The singleton pages `homepagenew`, `oor-annlin-gemeente`, and `jaarprogram` are deliberate custom builds rather than mirrored WordPress bodies.
- The text-coverage audit still reports `11` low-scoring records. Manual checks confirmed that its strongest outliers are expected normalization differences:
  - `Pinksterfeesvieringe 4 & 5 Junie 2022` preserves the source event image but omits the
    expired WordPress RSVP form.
  - `Fontein Redaksie` preserves the source's substantive status text, `Webblad onder konstruksie`.
- `npm run content:test` passes.

## WordPress shutdown status

- The WordPress binary-media archive blocker is cleared.
- Technical evidence through `2026-08-05`:
  - `scripts/import-wordpress-media.ts` completed with `failed: 0`
  - `inventoried: 597`
  - `copiedToStorage + skippedExistingStorage = 597`
  - `scripts/audit-wordpress-migration.ts` reports `migratedMediaAssets: 597`, `missingMedia: 0`, and `oldDomainRows: 0`
  - The route/media audit against production reports `missingContent: 0`, `missingEvents: 0`, `badRoutes: 0`, `badRedirects: 0`, and `wordpressOfflineReady: true`; its aggregate result is not sufficient semantic shutdown evidence on its own.
  - The deployed public crawl reports `brokenPages: 0`, `requestFailures: 0`, `seedFailures: 0`, `legacyPageLinks: 0`, and `legacyMediaLinks: 0`
  - The deployed crawl visited `51` pages without hitting its page limit
  - All `597` current WordPress media items are independently inventoried in R2
  - gstack browser QA confirmed the deployed `Leesstof en publikasies` library and active Google Play and Apple App Store links. A mobile publication-card overflow found during QA was fixed; the final `375px` viewport measures `375px` document width with no console errors.
- Caveat:
  - The text comparison still reports `11` low-similarity warnings caused by intentional editorial, normalization, and redesign differences. All corresponding records are present, so these are not WordPress runtime dependencies.
  - The first-class publication library is deployed and production-crawled, with `239 / 239` canonical records and successful R2 responses.
  - The current `Jeug` gallery difference must be resolved and the inline-asset audit rerun.
  - Direct future R2 uploads from admin require deployment of the signed upload Worker. The existing Cloudflare token can manage R2 objects but currently lacks `Workers Scripts: Edit`.

## Practical implication

- The structured pages, service groups, events, binary media archive and first-class publication records are migrated in the database.
- Do not switch WordPress off yet. The current Jeug gallery must be migrated and the direct admin R2 upload path must be operational.
- Pieter retains the final shutdown decision after the updated evidence has been reviewed.
