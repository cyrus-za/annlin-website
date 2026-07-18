# Website Transition Notes

Last updated: 2026-07-16

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
- WordPress service-group pages expose these named contacts publicly:
  - `Jeug`: Lisa Vosloo, oudl. Thomas Venter, Zoë Venter, Clarissa Rehder
  - `Gebedsgroep`: Carina Pyper
  - `Terebinte`: ouderling Hannes Venter
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

Results on `2026-07-16`:

- WordPress pages checked: `48`
- Active service groups migrated: `16 / 16`
- News pages migrated: `8 / 8`
- Events retained in the new database: `38`
  - The current WordPress events API returned `34`; all `34` were present in the new database.
- Public pages crawled on the deployed site: `49`
- Broken public pages: `0`
- Public request or route-discovery failures: `0`
- Redirect failures for legacy slugs: `0`
- Links back to old WordPress pages: `0`
- Remaining old-domain data references are WordPress media URLs only; there are no old-page links.

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

Verification on `2026-07-16`:

- Migrated pages with missing rendered asset references: `0`
- Missing migrated asset references: `0`
- Redesigned singleton pages with expected source differences: `3`
  - These are intentionally custom implementations rather than copied WordPress bodies.
- WordPress page-level asset references not yet present in the independent media archive: `186`
- The text-coverage audit still reports `11` low-scoring records. Manual checks confirmed
  that its strongest outliers are expected normalization differences:
  - `Pinksterfeesvieringe 4 & 5 Junie 2022` preserves the source event image but omits the
    expired WordPress RSVP form.
  - `Fontein Redaksie` preserves the source's substantive status text, `Webblad onder konstruksie`.
- `npm run content:test` passes.

## Remaining blocker before WordPress can be fully switched off

- The WordPress media archive is not yet copied into independent storage.
- Current audit:
  - WordPress media items: `587`
  - Media items in the complete independent archive: `0 / 587`
  - Known WordPress media size: `903,517,441` bytes, about `862 MiB`
  - Media entries without source size metadata: `219`
  - WordPress media links currently reachable from public migrated pages: `54`
  - Page-level asset references not yet present in the archive: `186`
- Selected images and documents already live in `public/migrated`, but that is not a complete
  backup of the WordPress media library.
- The planned destination is Cloudflare R2. The migration needs the church Cloudflare account,
  an R2 bucket, a public media URL, and appropriately scoped credentials.
- Existing media continues to render from WordPress for now, but it is not safe to switch off
  WordPress before the R2 copy and URL rewrite are complete.

### R2 migration runbook

Use the church Cloudflare account and keep all credentials in ignored local environment files.
The importer is resumable: it records an asset only after a successful upload, and a later run
skips matching completed objects.

1. Create the archive bucket and enable its temporary public URL:

   ```bash
   wrangler r2 bucket create annlin-media
   wrangler r2 bucket dev-url enable annlin-media
   wrangler r2 bucket dev-url get annlin-media
   ```

2. Configure these migration variables without a `NEXT_PUBLIC_` prefix:

   ```dotenv
   R2_BUCKET_NAME=annlin-media
   R2_PUBLIC_BASE_URL=https://the-generated-public-host.r2.dev
   ```

3. Load both the website/database environment and the church Cloudflare environment. Run a
   single-object smoke test first:

   ```bash
   npx tsx scripts/import-wordpress-media.ts --storage=r2 --copy-files --limit=1
   ```

4. Confirm the generated object URL is publicly readable, then run the complete archive:

   ```bash
   npx tsx scripts/import-wordpress-media.ts --storage=r2 --copy-files
   ```

5. Rerun `scripts/audit-wordpress-migration.ts`, `scripts/audit-wordpress-inline-assets.ts`,
   `npm run content:test`, the production build, and the deployed public link crawler. WordPress
   may be retired only after all copied objects are accounted for and no public WordPress media
   links remain.

## Practical implication

- The new structured pages, service groups, news items, and events are migrated.
- The major remaining shutdown risk is the WordPress media library itself:
  - PDFs
  - bulletin files
  - historical images
  - downloadable attachments
- Before taking WordPress offline, complete the R2 archive copy, rewrite old media URLs, and
  rerun both migration audits and the deployed public crawler.
