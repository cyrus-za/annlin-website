# Website Transition Notes

Last updated: 2026-07-06

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
  - `Terebinte`: ouderling Hannes Venter
  - `Susters`: Magda du Toit
  - `Sekuriteit`: oudl. Jan Rehder

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
  - `Gebedsgroep`
  - `Evangelisasie`
  - `Tweedehandse Goedere Verkoping`
  - `Fontein Redaksie`
  - `Vroue Bedieningsgroep`
  - Until confirmed, unnamed Diakonie service groups are routed through `Diakonie`; other unnamed groups remain routed through the kerkkantoor.

## Migration audit summary

Audit run against:

- WordPress: `https://annlin.co.za`
- New site: `https://annlin.venter.pro`

Results on `2026-07-06`:

- WordPress pages checked: `48`
- Active service groups migrated: `16 / 16`
- News pages migrated: `8 / 8`
- Events migrated: `38 / 38`
- Public route failures: `0`
- Redirect failures for legacy slugs: `0`
- Remaining hardcoded old-domain references in app data audited by script: `0`

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

Pending verification:

- Re-run `scripts/import-wordpress-content.ts` against the production database.
- Re-run `scripts/audit-wordpress-inline-assets.ts`.
- Expected improvement: the missing news and archive page assets above should be restored
  in rendered DB content after the re-import.
- The remaining singleton pages (`jaarprogram`, `oor-annlin-gemeente`, and the redesigned
  homepage) should be reviewed manually because they are intentionally implemented as
  custom pages, not imported WordPress body content.

## Remaining blocker before WordPress can be fully switched off

- WordPress media archive is not yet fully copied into Vercel Blob.
- Audit found:
  - WordPress media items: `584`
  - Missing archived media items in the new system: `584`
  - Known WordPress media size: about `902,885,400` bytes
  - Media entries with unknown source size metadata: `219`
- I attempted the automated blob migration, but the local `BLOB_READ_WRITE_TOKEN` is still a placeholder, so the full copy could not run.
- The latest inline-asset audit also found `186` page-level asset references that are not
  yet archived in the new system. They can render from WordPress for now, but they are not
  safe if WordPress is switched off before the media copy runs.

## Practical implication

- The new structured pages, service groups, news items, and events are migrated.
- The major remaining shutdown risk is the WordPress media library itself:
  - PDFs
  - bulletin files
  - historical images
  - downloadable attachments
- Before taking WordPress offline, provide a real blob write token and run the media archive migration.
