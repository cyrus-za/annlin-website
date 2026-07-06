# Annlin WordPress Migration Audit

Date: 2026-07-06

## Status

The new site is not yet safe as a full WordPress replacement.

The public navigation no longer needs to 404 after the latest fixes, but WordPress
still contains published content that has not been fully migrated into the new
site or database.

## WordPress Inventory

Source checks:

- `${WORDPRESS_BASE_URL}/wp-json/wp/v2/pages?per_page=100`
- `${WORDPRESS_BASE_URL}/wp-json/wp/v2/posts?per_page=100`
- `${WORDPRESS_BASE_URL}/wp-json/tribe/events/v1/events?per_page=100`

Results:

- Published WordPress pages found: 48
- Published WordPress posts returned by API: 0
- Upcoming calendar events returned by Events Calendar API: 38
- The WordPress sitemap endpoint returns a WordPress 404 page, so the REST API is the more reliable inventory source.

## Covered On New Site

These WordPress surfaces have clear equivalents on the new site:

- Home: `/`
- Oor Annlin Gemeente: `/oor-annlin-gemeente`
- Jaarprogram: `/jaarprogram`
- Kontakbesonderhede: `/kontakbesonderhede`
- Onlangse video uitsendings van preke: `/uitsendings`
- Diensgroepe index: `/diensgroepe`
- Leesstof index: `/leesstof`
- Nuus index: `/nuus`

## Fixed During This Audit

- Added public `/nuus` page.
- Added public `/leesstof` page.
- Added public `/privaatheid` page.
- Added public `/gebruiksvoorwaardes` page.
- Allowed anonymous read-only `GET /api/diensgroepe`, because public pages rely on it.
- Added redirects for old WordPress slugs where the new app has a clear landing page.

## Remaining Content Gaps

### Diensgroepe

WordPress has many individual group pages. The new site currently has a
service-group listing and admin model, but only a small starter set was seeded.
These WordPress pages still need either dedicated migration into service-group
records or richer content on `/diensgroepe`:

- Fontein Redaksie
- Sekuriteit
- Vervoer
- Verwelkoming en Gasvryheid
- Versorging en Barmhartigheid
- Tradisionele Dienste
- Sosiale Dienste
- Seniors
- Terebinte
- Jeug
- Mosambiek Whatsappgroep
- Vroue Bedieningsgroep
- Manne Bedieningsgroep
- Tweedehandse goedere verkopings
- Koor
- Verwelkoming
- Katkisasie leerkragte
- Rousmart
- Susters
- Kleuterbediening
- Gebedsgroep
- Verslawing2
- Laerskooljeug
- Katkisasie fotoblad
- Siekebesoeke
- Buitelandse Evangelisasie
- Bybelverspreiding
- Evangelisasie Blad
- Evangelisasie Omliggende Gebiede
- Evangelisasie Eie Omgewing

### Leesstof

The new `/leesstof` page now prevents a 404 and links to the old archive, but
the underlying content still needs to be copied into the new app before
WordPress can be removed:

- Leesstof
- Preek Samevattings
- Oordenkings: Ons gesels oor Jesus
- Kinderwerkkaarte
- Ek wil weet

### Nuus

The new `/nuus` page now prevents a 404 and links to old archive pages, but the
archive content itself still needs migration:

- Nuus 2026
- Nuus 2024
- Nuus 2023
- Nuus 2022
- Nuus 2021
- Susters Saamtrek 2024
- Pinksterfeesvieringe 4 & 5 Junie 2022
- Uitnodiging - Diensteblad

### Jaarprogram

The old WordPress Events Calendar API currently returns upcoming events. The new
site has the event model and admin UI, but production returned no July 2026
events during testing. These events should be imported before WordPress is taken
offline.

## Recommendation Before WordPress Cutover

1. Import WordPress service-group pages into `ServiceGroup` records or create
   individual public pages for each group.
2. Import WordPress Events Calendar entries into the new `Event` table.
3. Import reading material and news archive content into first-class new-site
   content, not just bridge links to WordPress.
4. Re-run a link audit after import.
5. Only then point the production DNS at the new deployment.
