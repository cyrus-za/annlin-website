# Website Transition Notes

Last updated: 2026-07-18

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

Results on `2026-07-18`:

- WordPress pages checked: `48`
- Active service groups migrated: `16 / 16`
- News pages migrated: `8 / 8`
- Events retained in the new database: `38`
  - The current WordPress events API returned `34`; all `34` were present with matching Pretoria-local start times.
- WordPress media items independently archived to Cloudflare R2: `592 / 592`
  - The live WordPress library grew from the earlier `587` count to `592` items before the final run.
  - `UploadedAsset` inventory rows: `592`
  - Total archived bytes copied or confirmed in R2: `1,047,314,911`
  - WordPress media entries without source size metadata: `219`
- Public pages crawled on the deployed site: `49`
- Broken public pages: `0`
- Public request or route-discovery failures: `0`
- Redirect failures for legacy slugs: `0`
- Links back to old WordPress pages: `0`
- Links back to old WordPress media URLs: `0`
- Remaining old-domain data references in migrated records: `0`
- Independent R2 object verification: `592 / 592` returned successfully with matching recorded sizes.
- Final migration audit result: `wordpressOfflineReady: true`

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

Verification on `2026-07-18`:

- Migrated pages with missing rendered asset references in the comparison audit: `6`
- Missing migrated asset references in the comparison audit: `9`
- Redesigned singleton pages with expected source differences: `3`
  - These are intentionally custom implementations rather than copied WordPress bodies.
- WordPress page-level asset references not yet present in the independent media archive: `25`
- The remaining inline-asset mismatches are not live broken links on the new site:
  - `susters-saamtrek-2024`, `nuus-2023`, `nuus-2022`, `nuus-2021`, and `preke-op-skrif` still reference source-only WordPress files that now return `404` on WordPress and were therefore removed from migrated public content.
  - `kinderwerkkaarte` still differs by one historical PDF link that is not in the independent archive, but the page no longer publishes old-domain URLs.
  - The singleton pages `homepagenew`, `oor-annlin-gemeente`, and `jaarprogram` are deliberate custom builds rather than mirrored WordPress bodies.
- The text-coverage audit still reports `11` low-scoring records. Manual checks confirmed that its strongest outliers are expected normalization differences:
  - `Pinksterfeesvieringe 4 & 5 Junie 2022` preserves the source event image but omits the
    expired WordPress RSVP form.
  - `Fontein Redaksie` preserves the source's substantive status text, `Webblad onder konstruksie`.
- `npm run content:test` passes.
## WordPress media shutdown status

- The WordPress media archive blocker is cleared.
- Technical evidence on `2026-07-18`:
  - `scripts/import-wordpress-media.ts` completed with `failed: 0`
  - `inventoried: 592`
  - `copiedToStorage + skippedExistingStorage = 592`
  - `scripts/audit-wordpress-migration.ts` reports `migratedMediaAssets: 592`, `missingMedia: 0`, and `oldDomainRows: 0`
  - The same audit reports `missingContent: 0`, `missingEvents: 0`, and `wordpressOfflineReady: true`
  - The deployed public crawl reports `brokenPages: 0`, `requestFailures: 0`, `seedFailures: 0`, `legacyPageLinks: 0`, and `legacyMediaLinks: 0`
  - All `592` inventoried R2 objects returned successfully with matching recorded sizes
  - gstack browser QA found no console errors, failed requests, broken images, or horizontal overflow on representative desktop and mobile pages
- Caveat:
  - The text comparison still reports `11` low-similarity warnings caused by intentional editorial, normalization, and redesign differences. All corresponding records are present, so these are not WordPress runtime dependencies.

## Practical implication

- The new structured pages, service groups, news items, events, and WordPress media archive are migrated.
- It is technically safe to switch WordPress off: the final audit, independent object verification, public crawl, and browser QA found no remaining runtime dependency.
- Pieter should still make the final shutdown decision after reviewing the audit evidence above.
