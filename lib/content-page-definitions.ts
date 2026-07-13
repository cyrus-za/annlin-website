export type ContentFieldKind = 'text' | 'textarea' | 'lines' | 'paragraphs'

export interface ContentFieldDefinition {
  path: string
  label: string
  kind: ContentFieldKind
  help?: string
}

export interface ContentFieldGroup {
  title: string
  description?: string
  fields: ContentFieldDefinition[]
}

export interface ContentPageDefinition {
  slug: string
  route: string
  title: string
  description: string
  sections: Record<string, unknown>
  groups: ContentFieldGroup[]
}

const text = (path: string, label: string, help?: string): ContentFieldDefinition => ({
  path,
  label,
  help,
  kind: 'text',
})

const area = (path: string, label: string, help?: string): ContentFieldDefinition => ({
  path,
  label,
  help,
  kind: 'textarea',
})

const lines = (path: string, label: string, help?: string): ContentFieldDefinition => ({
  path,
  label,
  help,
  kind: 'lines',
})

const paragraphs = (path: string, label: string, help?: string): ContentFieldDefinition => ({
  path,
  label,
  help,
  kind: 'paragraphs',
})

export const CONTENT_PAGE_DEFINITIONS: ContentPageDefinition[] = [
  {
    slug: 'tuis',
    route: '/',
    title: 'Tuisblad',
    description: 'Die hoofopskrifte en inleidende inhoud op die publieke tuisblad.',
    sections: {
      hero: {
        title: 'Welkom by Annlin Gemeente',
        subtitle: 'Gereformeerde Kerk Pretoria-Annlin',
        body: "Geroep tot 'n lewende geloof in God-Drie-Enig waar almal hul gawes tot Sy eer gebruik. H/v Braam Pretoriusstraat en Kaneelbaslaan, Wonderboom, Pretoria.",
      },
      events: {
        title: 'Komende Gebeure',
        body: 'Sluit by ons aan vir hierdie spesiale geleenthede',
        empty: 'Geen komende gebeure geskeduleer nie.',
      },
      serviceGroups: {
        title: 'Diensgroepe',
        body: 'Raak betrokke by die bedieningswerk van die gemeente.',
      },
      explore: {
        title: 'Verken Ons Webwerf',
        body: 'Vind alles wat jy nodig het om betrokke te raak by ons gemeente',
      },
      about: {
        title: 'Oor Annlin Gemeente',
        body: "Ons is 'n lewendige gemeente wat toegewy is aan die verkondiging van God se Woord en die bou van 'n gemeenskap waar almal welkom is. Ons glo in die krag van geloof, hoop en liefde om lewens te transformeer.",
        bullets: [
          'Eredienste elke Sondag om 08:30 en 18:30',
          'Aktiewe jeug- en kinderprogramme',
          'Gemeenskapsbetrokkenheid en uitreikprogramme',
        ],
      },
      history: {
        title: 'Ons Geskiedenis',
        subtitle: 'Gestig in 1965',
        body: 'Lees meer oor die ontstaan van Gereformeerde Kerk Pretoria-Annlin en die ingebruikneming van ons kerkgebou.',
      },
      visit: {
        title: 'Besoek Ons',
        body: 'Eredienstye, ligging en kontakbesonderhede',
      },
    },
    groups: [
      {
        title: 'Hoofbanier',
        fields: [
          text('hero.title', 'Hoofopskrif'),
          text('hero.subtitle', 'Subopskrif'),
          area('hero.body', 'Inleidende teks'),
        ],
      },
      {
        title: 'Tuisbladafdelings',
        fields: [
          text('events.title', 'Komende gebeure-opskrif'),
          text('events.body', 'Komende gebeure-inleiding'),
          text('events.empty', 'Boodskap wanneer daar geen gebeure is nie'),
          text('serviceGroups.title', 'Diensgroepe-opskrif'),
          text('serviceGroups.body', 'Diensgroepe-inleiding'),
          text('explore.title', 'Verken-afdeling se opskrif'),
          text('explore.body', 'Verken-afdeling se inleiding'),
        ],
      },
      {
        title: 'Oor en besoek',
        fields: [
          text('about.title', 'Oor-afdeling se opskrif'),
          area('about.body', 'Oor-afdeling se teks'),
          lines('about.bullets', 'Kernpunte', 'Een punt per reël.'),
          text('history.title', 'Geskiedenis-kaart se opskrif'),
          text('history.subtitle', 'Geskiedenis-kaart se subopskrif'),
          area('history.body', 'Geskiedenis-kaart se teks'),
          text('visit.title', 'Besoek-kaart se opskrif'),
          text('visit.body', 'Besoek-kaart se beskrywing'),
        ],
      },
    ],
  },
  {
    slug: 'oor-annlin-gemeente',
    route: '/oor-annlin-gemeente',
    title: 'Oor Annlin Gemeente',
    description: 'Die gemeente se roeping, geskiedenis, leierskap, waardes en fasiliteite.',
    sections: {
      hero: {
        title: 'Oor Annlin Gemeente',
        subtitle: 'Gereformeerde Kerk Pretoria-Annlin',
        body: "Geroep tot 'n lewende geloof in God-Drie-Enig waar almal hul gawes tot Sy eer gebruik",
      },
      calling: {
        title: 'Ons Roeping',
        body: 'Ons wil die mense in ons omgewing en verder, aan Jesus en aan mekaar verbind om God se missie op aarde in opdrag van Jesus voort te sit.',
        visionTitle: 'Ons Visie',
        visionBody: "'n Eensgesinde gemeente wat mense ontwikkel en toerus tot verantwoordelike, produktiewe Christene vir hul bedieninge in die kerk en die wêreld tot die eer van God.",
        faithTitle: 'Ons Geloof',
        faithBody: 'As kerk van Christus eer ons ons God en bedien ons mekaar met sy Woord en reik ook uit na buite. Ons doen dit omdat ons gedring word deur die liefde van God.',
        communityTitle: 'Ons Gemeenskap',
        communityBody: "Benewens die kerklike ampte, speel diensgroepe 'n belangrike rol om ons roeping as bruidsgemeente van Christus uit te leef.",
      },
      history: {
        title: 'Ons Geskiedenis',
        foundingTitle: '1965 - Stigting',
        foundingBody: "Die Gereformeerde Kerk Pretoria-Annlin is op 16 Oktober 1965 gestig as 'n afstigting van die Gereformeerde Kerk Eloffsdal-Wonderboom-Suid.",
        buildingTitle: '1974 - Kerkgebou',
        buildingBody: 'Die kerkgebou is op 20 April 1974 amptelik in gebruik geneem. Die teksvers op die gedenkplaat is 1 Korintiërs 3:9: "Want ons is medewerkers van God; die akker van God, die gebou van God is julle."',
        todayTitle: 'Vandag',
        todayBody: "Onder leiding van ds. Pieter Kurpershoek (vanaf Oktober 2023) bedien ons 'n lewende gemeente van 631 belydende lidmate en 132 dooplidmate.",
        oldImageTitle: 'Kerkgebou 1974',
        oldImageBody: 'Kort nadat dit in gebruik geneem is',
        currentImageTitle: 'Kerkgebou Vandag',
        currentImageBody: 'Die vergrote kerkgebou, 2019',
      },
      leadership: {
        title: 'Leierskap',
        ministerName: 'Ds. Pieter Kurpershoek',
        ministerRole: 'Predikant (vanaf Oktober 2023)',
        ministerBody: "Ds. Kurpershoek lei ons gemeente as enkelleraar en bring 'n hart vir evangelisasie en gemeenskapsbou na sy bediening.",
        councilTitle: 'Kerkraad',
        councilBody: 'Ons kerkraad bestaan uit toegewyde ouderlinge en diakens wat die gemeente help lei en bedien volgens Bybelse beginsels.',
        graceTitle: 'Grace Reformed Church',
        graceBody: "In 2019 het 'n Engelse gemeente, Grace Reformed Church, van ons afgeskei. Ons deel steeds die kerkgebou en fasiliteite in broederskap.",
      },
      values: {
        title: 'Ons Waardes',
        scriptureTitle: 'Skrifgetrouheid',
        scriptureBody: 'Ons glo in die onfeilbaarheid en gesag van die Bybel as God se Woord.',
        communityTitle: 'Gemeenskap',
        communityBody: 'Ons bou betekenisvolle verhoudings en ondersteun mekaar in geloof.',
        evangelismTitle: 'Evangelisasie',
        evangelismBody: 'Ons is toegewy aan die verspreiding van die Evangelie plaaslik en internasionaal.',
        serviceTitle: 'Diensbaarheid',
        serviceBody: 'Ons moedig lidmate aan om hul gawes te gebruik in diens van God en die gemeenskap.',
        graceTitle: 'Genade',
        graceBody: 'Ons verwelkom almal met ope arms, ongeag agtergrond of omstandighede.',
      },
      detailedHistory: {
        title: 'Ons Ryk Geskiedenis',
        beginningTitle: '1960s - Die Begin',
        beginningParagraphs: [
          'In 1958 was daar maar enkele Gereformeerde lidmate woonagtig noord van die Magaliesberg en oos van die Apiesrivier. Die ontwikkeling van die gebied het so vinnig plaasgevind dat die Pretoria-Annlin gemeente in 1965 as onafhanklike gemeente kon afstig.',
          'Ds. J.H. Boneschans is as die eerste predikant beroep en het van 1965 tot 1969 gedien.',
        ],
        buildingTitle: '1970s - Kerkbou',
        buildingParagraphs: [
          "Twee erwe is deur suster A.E. van der Linde geskenk, en 'n verdere 1 morg grond deur suster C.M van Deventer. Dit is die grond waarop die kerkgebou vandag staan.",
          'In 1972 gee die kerkraad vir argitek Johan de Ridder opdrag om die kerkgebou te ontwerp. Die kerkgebou is op 20 April 1974 amptelik in gebruik geneem.',
        ],
        modernTitle: 'Moderne Era - Groei en Uitbreiding',
        modernParagraphs: [
          "Die gemeente het gegroei en in 1977 het Magalieskruin van ons afgeskei. In 1978 is die kerkgebou vergroot vanweë 'n steeds toenemende lidmaattal.",
          "'n Kerksaal met plek vir 450 mense en 12 katkisasielokale is in 1981 in gebruik geneem.",
          'Die sendingopdrag is hoog op ons prioriteit en lidmate is aktief met evangelisasie in eie omgewing, omliggende gebiede en in die buiteland.',
        ],
      },
      visit: {
        title: 'Kom Besoek Ons',
        body: 'Ons is geleë in die hart van Wonderboom, Pretoria',
        ministryArea: 'Ons bedieningsgebied lê hoofsaaklik noord van die Magaliesbergreeks met die Apiesrivier as westelike grens, en sluit voorstede soos Annlin, Sinoville, Doornpoort en Wonderboom in.',
        churchBody: 'Eredienste en spesiale geleenthede',
        hallBody: '450 sitplekke vir byeenkomste',
        classroomsBody: '12 klaskamers vir onderrig',
        parkingBody: 'Voldoende parkering beskikbaar',
        accessibilityBody: 'Ons fasiliteite is toeganklik vir rolstoelgebruikers en ons verwelkom alle lidmate ongeag fisiese beperkings.',
      },
      cta: {
        title: 'Sluit by Ons Gemeente Familie Aan',
        body: 'Ons nooi jou uit om deel te word van ons lewende gemeente waar geloof, hoop en liefde saamkom.',
      },
    },
    groups: [
      {
        title: 'Hoofbanier en roeping',
        fields: [
          text('hero.title', 'Hoofopskrif'),
          text('hero.subtitle', 'Subopskrif'),
          area('hero.body', 'Inleidende teks'),
          text('calling.title', 'Roeping-opskrif'),
          area('calling.body', 'Roeping-teks'),
          text('calling.visionTitle', 'Visie-opskrif'),
          area('calling.visionBody', 'Visie-teks'),
          text('calling.faithTitle', 'Geloof-opskrif'),
          area('calling.faithBody', 'Geloof-teks'),
          text('calling.communityTitle', 'Gemeenskap-opskrif'),
          area('calling.communityBody', 'Gemeenskap-teks'),
        ],
      },
      {
        title: 'Geskiedenis-oorsig',
        fields: [
          text('history.title', 'Afdelingopskrif'),
          text('history.foundingTitle', 'Stigting-opskrif'),
          area('history.foundingBody', 'Stigting-teks'),
          text('history.buildingTitle', 'Kerkgebou-opskrif'),
          area('history.buildingBody', 'Kerkgebou-teks'),
          text('history.todayTitle', 'Vandag-opskrif'),
          area('history.todayBody', 'Vandag-teks'),
          text('history.oldImageTitle', 'Ou foto se opskrif'),
          text('history.oldImageBody', 'Ou foto se beskrywing'),
          text('history.currentImageTitle', 'Nuwe foto se opskrif'),
          text('history.currentImageBody', 'Nuwe foto se beskrywing'),
        ],
      },
      {
        title: 'Leierskap',
        fields: [
          text('leadership.title', 'Afdelingopskrif'),
          text('leadership.ministerName', 'Predikant se naam'),
          text('leadership.ministerRole', 'Predikant se rol'),
          area('leadership.ministerBody', 'Predikant se beskrywing'),
          text('leadership.councilTitle', 'Kerkraad-opskrif'),
          area('leadership.councilBody', 'Kerkraad-teks'),
          text('leadership.graceTitle', 'Grace Reformed Church-opskrif'),
          area('leadership.graceBody', 'Grace Reformed Church-teks'),
        ],
      },
      {
        title: 'Waardes',
        fields: [
          text('values.title', 'Afdelingopskrif'),
          text('values.scriptureTitle', 'Waarde 1'),
          area('values.scriptureBody', 'Waarde 1 se teks'),
          text('values.communityTitle', 'Waarde 2'),
          area('values.communityBody', 'Waarde 2 se teks'),
          text('values.evangelismTitle', 'Waarde 3'),
          area('values.evangelismBody', 'Waarde 3 se teks'),
          text('values.serviceTitle', 'Waarde 4'),
          area('values.serviceBody', 'Waarde 4 se teks'),
          text('values.graceTitle', 'Waarde 5'),
          area('values.graceBody', 'Waarde 5 se teks'),
        ],
      },
      {
        title: 'Uitgebreide geskiedenis',
        fields: [
          text('detailedHistory.title', 'Afdelingopskrif'),
          text('detailedHistory.beginningTitle', 'Begin-opskrif'),
          paragraphs('detailedHistory.beginningParagraphs', 'Begin-paragrawe', 'Skei paragrawe met ’n leë reël.'),
          text('detailedHistory.buildingTitle', 'Kerkbou-opskrif'),
          paragraphs('detailedHistory.buildingParagraphs', 'Kerkbou-paragrawe', 'Skei paragrawe met ’n leë reël.'),
          text('detailedHistory.modernTitle', 'Moderne era-opskrif'),
          paragraphs('detailedHistory.modernParagraphs', 'Moderne era-paragrawe', 'Skei paragrawe met ’n leë reël.'),
        ],
      },
      {
        title: 'Besoek en oproep',
        fields: [
          text('visit.title', 'Besoek-afdeling se opskrif'),
          text('visit.body', 'Besoek-afdeling se inleiding'),
          area('visit.ministryArea', 'Bedieningsgebied'),
          text('visit.churchBody', 'Hoofkerk-beskrywing'),
          text('visit.hallBody', 'Kerksaal-beskrywing'),
          text('visit.classroomsBody', 'Katkisasielokale-beskrywing'),
          text('visit.parkingBody', 'Parkering-beskrywing'),
          area('visit.accessibilityBody', 'Toeganklikheid'),
          text('cta.title', 'Onderste oproep se opskrif'),
          area('cta.body', 'Onderste oproep se teks'),
        ],
      },
    ],
  },
  {
    slug: 'kontak',
    route: '/kontak',
    title: 'Kontakvorm',
    description: 'Opskrifte en terugvoer rondom die publieke kontakvorm.',
    sections: {
      hero: {
        title: 'Kontak Ons',
        body: "Ons is hier om jou te help. Stuur vir ons 'n boodskap of gebruik ons kontakbesonderhede.",
      },
      form: {
        title: "Stuur vir Ons 'n Boodskap",
        body: 'Vul die vorm in en die kerkkantoor sal jou navraag ontvang.',
        privacy: 'Moet asseblief nie vertroulike pastorale besonderhede deur hierdie vorm stuur nie.',
      },
      success: {
        title: 'Boodskap Ontvang!',
        body: 'Dankie. Jou navraag is by die kerkkantoor afgelewer.',
      },
    },
    groups: [
      {
        title: 'Kontakvorm',
        fields: [
          text('hero.title', 'Bladsyopskrif'),
          area('hero.body', 'Bladsy-inleiding'),
          text('form.title', 'Vormopskrif'),
          area('form.body', 'Vormbeskrywing'),
          area('form.privacy', 'Privaatheidswaarskuwing'),
          text('success.title', 'Suksesopskrif'),
          area('success.body', 'Suksesboodskap'),
        ],
      },
    ],
  },
  {
    slug: 'kontakbesonderhede',
    route: '/kontakbesonderhede',
    title: 'Kontakbesonderhede',
    description: 'Inleidings, personeelinligting en besoekersboodskappe op die kontakblad.',
    sections: {
      hero: {
        title: 'Kontak Besonderhede',
        body: 'Kontak die kerkkantoor vir algemene navrae, besoekersinligting en praktiese reëlings rakende die gemeente.',
      },
      office: {
        note: "Los asseblief 'n boodskap indien ons nie dadelik antwoord nie en ons sal so gou as moontlik terugkom na jou toe.",
      },
      staff: {
        ministerTitle: 'Predikant',
        ministerName: 'Ds. Pieter Kurpershoek',
        ministerBody: 'Kontak via kerkkantoor',
        officeTitle: 'Kerkkantoor',
        officeBody: 'Algemene navrae en administrasie',
        emailBody: 'Vir navrae, nuwe besoekers en terugvoering',
      },
      cta: {
        title: 'Gereed om ons te besoek?',
        body: "Ons sien daarna uit om jou by 'n erediens of gemeentegeleentheid te verwelkom.",
      },
    },
    groups: [
      {
        title: 'Bladsy-inleiding',
        fields: [
          text('hero.title', 'Hoofopskrif'),
          area('hero.body', 'Inleidende teks'),
          area('office.note', 'Kantoorboodskap'),
        ],
      },
      {
        title: 'Personeel',
        fields: [
          text('staff.ministerTitle', 'Predikant-opskrif'),
          text('staff.ministerName', 'Predikant se naam'),
          text('staff.ministerBody', 'Predikant se kontaknota'),
          text('staff.officeTitle', 'Kerkkantoor-opskrif'),
          area('staff.officeBody', 'Kerkkantoor-beskrywing'),
          area('staff.emailBody', 'E-posbeskrywing'),
        ],
      },
      {
        title: 'Onderste oproep',
        fields: [
          text('cta.title', 'Opskrif'),
          area('cta.body', 'Teks'),
        ],
      },
    ],
  },
  {
    slug: 'privaatheid',
    route: '/privaatheid',
    title: 'Privaatheid',
    description: 'Die publieke privaatheidsverklaring.',
    sections: {
      body: {
        title: 'Privaatheid',
        paragraphs: [
          "Hierdie webwerf publiseer gemeente-inligting, diensgroepe, eredienstye, uitsendings en kontakbesonderhede. Ons vra slegs persoonlike inligting wanneer jy self 'n kontakvorm invul of met die kerkkantoor kommunikeer.",
          'Inligting wat deur kontakvorms gestuur word, word gebruik om jou navraag te hanteer en word nie vir bemarking aan derde partye verkoop nie.',
          'Vir enige versoek oor persoonlike inligting, kontak die kerkkantoor by {{contactEmail}}.',
        ],
      },
    },
    groups: [
      {
        title: 'Privaatheidsverklaring',
        fields: [
          text('body.title', 'Opskrif'),
          paragraphs('body.paragraphs', 'Paragrawe', 'Skei paragrawe met ’n leë reël. Gebruik {{contactEmail}} waar die kerkkantoor se e-pos moet verskyn.'),
        ],
      },
    ],
  },
  {
    slug: 'gebruiksvoorwaardes',
    route: '/gebruiksvoorwaardes',
    title: 'Gebruiksvoorwaardes',
    description: 'Die publieke gebruiksvoorwaardes.',
    sections: {
      body: {
        title: 'Gebruiksvoorwaardes',
        paragraphs: [
          'Die inhoud op hierdie webwerf word verskaf as openbare gemeente-inligting vir Gereformeerde Kerk Pretoria-Annlin.',
          'Ons probeer om inligting akkuraat en op datum te hou, maar eredienstye, jaarprogram-inskrywings en kontakbesonderhede kan verander. Kontak die kerkkantoor indien jy bevestiging benodig.',
          'Eksterne skakels, soos YouTube en Kerkdienstgemist, word deur derde partye bestuur en val onder hul eie bepalings.',
        ],
      },
    },
    groups: [
      {
        title: 'Gebruiksvoorwaardes',
        fields: [
          text('body.title', 'Opskrif'),
          paragraphs('body.paragraphs', 'Paragrawe', 'Skei paragrawe met ’n leë reël.'),
        ],
      },
    ],
  },
]

export function getContentPageDefinition(slug: string): ContentPageDefinition | undefined {
  return CONTENT_PAGE_DEFINITIONS.find((definition) => definition.slug === slug)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function mergeRecords(
  defaults: Record<string, unknown>,
  value: Record<string, unknown>,
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...defaults }

  for (const [key, nextValue] of Object.entries(value)) {
    const defaultValue = defaults[key]
    if (!(key in defaults)) {
      merged[key] = nextValue
    } else if (isRecord(defaultValue)) {
      merged[key] = isRecord(nextValue) ? mergeRecords(defaultValue, nextValue) : defaultValue
    } else if (Array.isArray(defaultValue)) {
      merged[key] = Array.isArray(nextValue) ? nextValue : defaultValue
    } else if (typeof defaultValue === typeof nextValue) {
      merged[key] = nextValue
    }
  }

  return merged
}

export function mergeContentPageSections(
  definition: ContentPageDefinition,
  sections: unknown,
): Record<string, unknown> {
  return mergeRecords(definition.sections, isRecord(sections) ? sections : {})
}

export function readContentValue(sections: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((value, segment) => {
    return isRecord(value) ? value[segment] : undefined
  }, sections)
}

export function readContentText(sections: Record<string, unknown>, path: string): string {
  const value = readContentValue(sections, path)
  return typeof value === 'string' ? value : ''
}

export function readContentList(sections: Record<string, unknown>, path: string): string[] {
  const value = readContentValue(sections, path)
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

export function formatContentFieldValue(
  sections: Record<string, unknown>,
  field: ContentFieldDefinition,
): string {
  const value = readContentValue(sections, field.path)
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string').join(
      field.kind === 'paragraphs' ? '\n\n' : '\n',
    )
  }
  return typeof value === 'string' ? value : ''
}

function setContentValue(sections: Record<string, unknown>, path: string, value: unknown): void {
  const segments = path.split('.')
  let current = sections

  segments.forEach((segment, index) => {
    if (index === segments.length - 1) {
      current[segment] = value
      return
    }

    const next = current[segment]
    if (!isRecord(next)) current[segment] = {}
    current = current[segment] as Record<string, unknown>
  })
}

export function buildContentSectionsFromForm(
  definition: ContentPageDefinition,
  currentSections: unknown,
  formData: FormData,
): Record<string, unknown> {
  const sections = mergeContentPageSections(definition, currentSections)

  for (const group of definition.groups) {
    for (const field of group.fields) {
      const formValue = formData.get(field.path)
      const value = typeof formValue === 'string' ? formValue.trim() : ''

      if (field.kind === 'lines') {
        setContentValue(sections, field.path, value.split('\n').map((item) => item.trim()).filter(Boolean))
      } else if (field.kind === 'paragraphs') {
        setContentValue(sections, field.path, value.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean))
      } else {
        setContentValue(sections, field.path, value)
      }
    }
  }

  return sections
}
