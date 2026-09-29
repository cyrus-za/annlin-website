// Reviewed against Magda's 29 September 2026 email. Only targeted copy changes.
export const pageCopyChanges: ReadonlyArray<readonly [string, string]> = [
  ['Komende Gebeure', 'Komende gebeure'],
  ['Oor Annlin Gemeente', 'Oor Annlin-gemeente'],
  ['Ons Roeping', 'Ons roeping'],
  ['Ons Visie', 'Ons visie'],
  ['Ons Geloof', 'Ons geloof'],
  ['Ons Gemeenskap', 'Ons gemeenskap'],
  ['Ons Diensterreine', 'Ons diensterreine'],
  ['Ons Embleem', 'Ons embleem'],
  ['Ons Geskiedenis', 'Ons geskiedenis'],
  ['Moderne Era - Groei en Uitbreiding', 'Moderne era - groei en uitbreiding'],
  ['Kom Besoek Ons', 'Kom besoek ons'],
  ['Sluit by Ons Gemeente Familie Aan', 'Sluit by ons gemeente-familie aan'],
  ['Kontak Ons', 'Kontak ons'],
  ['Kontak Besonderhede', 'Kontakbesonderhede'],
]

export function revisePageCopy(value: unknown): unknown {
  if (typeof value === 'string') {
    return (pageCopyChanges.find(([old]) => old === value)?.[1] ?? value)
      .replace(' (vanaf Oktober 2023)', '')
  }
  if (Array.isArray(value)) return value.map(revisePageCopy)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, revisePageCopy(child)]))
  }
  return value
}

export const groupSlugs = [
  'hospitaalbesoeke', 'seniors-2', 'gebedsgroepe', 'evangelisasie-blad',
  'tweedehandse-goedere-verkopings', 'jeugdiensgroep', 'jeugbediening', 'sosiale-dienste',
] as const

export const groupNames: Record<string, string> = {
  'sosiale-dienste': 'Sosiale dienste',
  'tweedehandse-goedere-verkopings': 'Tweedehandse verkoping',
}

type Replacement = readonly [string, string]

const replacements: Record<string, readonly Replacement[]> = {
  hospitaalbesoeke: [['Groep samestelling', 'Groepsamestelling']],
  gebedsgroepe: [
    ["en lê die grondslag vir sukses in geestelike aktiwiteite", "wat die grondslag vorm van jou geestelike lewe"],
    ['die bose, omdat', 'die bose omdat'],
    ['Dit gaan oor God en Sy koninkryk om daardeur Sy Naam te verheerlik op aarde.', 'Die fokus bly altyd op God en Sy koninkryk en om Sy Naam op aarde te verheerlik.'],
    ['Gebedsgroepe wat die gemeente en sy aktiwiteite dra in die gebed', 'Om gebedsgroepe te ondersteun wat die gemeente en sy aktiwiteite in die gebed dra'],
    ['Verder om die gemeente', 'Verder ook om die gemeente'],
    ['oggend eredienste', 'oggenderedienste'],
    ['per Whatsapp of per epos deurgestuur na al die lede van die gebedsgroepe', 'per WhatsApp of per e-pos na al die lede van die gebedsgroepe deurgestuur'],
    ['"Gebedskild"', '"gebedskild"'],
    ['hulle in vertroue wil neem vir hulle vir persoonlike behoeftes nader', 'hulle in vertroue wil neem oor persoonlike behoeftes nader'],
    ['"`n Huis van Gebed "', '"\'n Huis van gebed"'],
    ['saam met ander lidmate aan gebed  deel te neem', 'saam met ander lidmate te bid'],
    ['uit  + 10 persone', 'uit ongeveer 10 persone'],
    ['word tans roteer', 'word tans geroteer'],
    ['vul asb die eposvormpie in by["Kontakbesonderhede"](/kontakbesonderhede)', 'vul asseblief die e-posvorm in by [Kontak ons](/kontak)'],
    ['telefoon nommer', 'telefoonnommer'],
    ['vul gerus die eposvormpie hieronder in', 'vul gerus die e-posvorm hieronder in'],
    ['dui dan asb so aan op die vormpie', 'dui dit asseblief so aan op die vorm'],
    ['Die epos gaan', 'Die e-pos gaan'],
    ['Carina Pyper en', 'Carina Pyper, en'],
    ['diskressie hanteer en die Gebedsgroep wys op die vertroulikheid daarvan', 'diskresie hanteer'],
    ['Neem asb vrymoedigheid', 'Neem asseblief vrymoedigheid'],
    ['ons land en Regering', 'ons land en regering'],
    ['gemeentes bv die', 'gemeentes, bv. die'],
    ['ons land, bv rampe', 'ons land, bv. rampe'],
  ],
  jeugbediening: [
    ['Die Kleuterbediening Diensgroep se visie is groepe kleuters in ons gemeente wat d.m.v. klein saadjies van kennis en geloof gegroei het tot kinders', 'Om kleuters in ons gemeente deur saadjies van kennis en geloof te laat groei tot kinders'],
    ['katkisasie jare', 'katkisasiejare'],
    ['Die Diensgroep', 'Die diensgroep'],
    ['die Diensgroep', 'die diensgroep'],
    ['blootgestel word aan die verhale in die bybel en sodoende gelydelik kennis opbou van ons Here', 'aan die verhale in die Bybel blootgestel word en sodoende geleidelik kennis van ons Here opbou'],
    ['Hul moet uitsien daarna', 'Hulle moet daarna uitsien'],
    ["Gekeurde lesmateriaal word aangebied deur 'n span geesdriftige ouers", "Gekeurde lesmateriaal word deur 'n span geesdriftige ouers aangebied"],
    ['Katkisasieklasse Sondae na die erediens aangebied vir Voorskools tot gr. 11', 'katkisasieklasse Sondae na die erediens vir kinders van voorskoolse ouderdom tot graad 11 aangebied'],
    ['Vanjaar se Kategete', 'Vanjaar se kategete'],
    ['Die Laerskool jeug', 'Die laerskooljeug'],
    ['voorskool - gr. 6', 'voorskool tot graad 6'],
    ['op n dieper vlak', "op 'n dieper vlak"],
    ['Middelskool Jeug', 'Middelskooljeug'],
    ['Die Middel skool jeug groep', 'Die middelskooljeuggroep'],
    ['Die Hoërskool jeug groep', 'Die hoërskooljeuggroep'],
    ['Studente- en Jongmense Groep', 'Studente- en jongmensegroep'],
    ["tussen die heen en gaan van 'n besige lewe, om mekaar te leer ken en te ondersteun", 'te midde van hul besige lewens sodat hulle mekaar kan leer ken en ondersteun'],
    ['[Kontak Ons ](/kontakbesonderhede)blad en vul die vormpie in', '[Kontak ons](/kontak)-blad en vul die vorm in'],
  ],
  jeugdiensgroep: [
    ['Jeug-diensgroep', 'Jeugdiensgroep'],
    ['3 sub-groepe waar die diakens fokus op die vertikale verhoudings tussen die kinders en die gemeente (koinonia)', 'drie subgroepe waar die diakens op die vertikale verhoudings tussen die kinders en die gemeente (koinonia) fokus'],
    ['sub-groepe', 'subgroepe'],
    ['Laerskool jeug', 'laerskooljeug'],
    ['Hoërskool jeuggroep', 'hoërskooljeuggroep'],
    ['Na-skool:', 'Naskool:'],
    ['by te staan met:', 'by te staan om:'],
    ['• Om hulle', '- Hulle'],
    ['• Om Bybelse', '- Bybelse'],
    ['• Om te verseker dat dit wat in die Bybel geleer word, daardie wyshede in die werklike lewe toegepas sal word binne die bediening van die gemeente.', '- Die wyshede wat in die Bybel geleer word in die werklike lewe binne die bediening van die gemeente toe te pas.'],
    ['• Jongmense te leer dat hulle waarde het in Christus en geroep word om hul gawes uit te leef.', '- Te besef dat hulle waarde het in Christus en geroep word om hul gawes uit te leef.'],
    ['katkisasie inhoud', 'katkisasie-inhoud'],
    ['wel op verhoudings bou', 'wel op die bou van verhoudings'],
  ],
  'sosiale-dienste': [
    ['bestaan uit uit', 'bestaan uit'],
    ["vier keer per jaar aangebied. Dan is daar", "vier keer per jaar gehou. Verder is daar"],
    ['maandellikse', 'maandelikse'],
    ['Ad hoc geleenthede:', 'Ad hoc-geleenthede:'],
  ],
  'tweedehandse-goedere-verkopings': [
    ['om uit te reik na hoofsaaklik werknemers in die omliggende gebied van die kerk', 'om na hoofsaaklik werknemers in die omliggende gebied van die kerk uit te reik'],
    ['weggee pryse', 'weggeepryse'],
    ['Die Tweedehandse Goedere Verkopings', 'Die tweedehandse verkopings'],
    ['Evangelisasie in Eie Omgewing', 'Evangelisasie in eie omgewing'],
    ['/leesstof/wp-archive-page-1325', '/diensgroepe/evangelisasie-blad'],
    ['/leesstof/wp-archive-page-1331', '/diensgroepe/evangelisasie-blad'],
    ['Natuurlik is een van die doelwitte van die tweedehandse verkopings om fondse in te samel, maar dit behoort nie die primêre doelwit te wees nie.', 'Al is een van die tweedehandse verkopings se doelwitte om fondse in te samel, is dit nie die primêre doelwit nie.'],
    ['Die volgende doelwitte word nagestreef met die verkopings.', '\n\nDie volgende doelwitte word nagestreef met die verkopings:'],
    ["'n paar dae", "'n Paar dae"],
    ['6vm', '06:00'],
    ["hulle werk 'n draai by ons kan kom maak", "hulle werk tyd het om 'n draai by ons te kan maak"],
    ["Vir elke koper word 'n pamfletjie met 'n bybelteks, die geloofsbelydenis en die kontakbesonderhede van die kerkkantoor en predikante in die hand gedruk. Met sommiges word gesprekke gevoer oor God se grootheid", "Elke koper ontvang 'n pamflet met 'n Bybelteks, die geloofsbelydenis en die kontakbesonderhede van die kerkkantoor en predikante. Gesprekke met die kopers bly belangrik. Ons gesels oor God se grootheid"],
  ],
  'evangelisasie-blad': [
    ["Ons visie is 'n Gemeente", "Om 'n gemeente daar te stel"],
    ['Ons missie is om ons gemeente', 'Om ons gemeente'],
    ['Ons doen dit as volg:', 'Ons doen dit soos volg:'],
    ['Vertakkings van Evangelisasie', 'Vertakkings van evangelisasie'],
    ['(Mat 28:19)', '(Matteus 28:19)'],
    ["Ons gemeente het dus die evangelisasiewerk opgedeel in bogenoemde vier vertakkings. Bybelverspreiding word gesien as 'n oorkoepelende taak wat in al drie ander gebiede voorkom.", "Ons gemeente se evangelisasiewerk vind plaas in ons eie omgewing, ons nabye omgewing en die buiteland. Bybelverspreiding is 'n oorkoepelende taak wat in al drie hierdie gebiede voorkom."],
    [' Voorbeelde van sulke projekte word hieronder genoem.', ''],
    ['1 Eie omgewing', '## Eie omgewing'],
    ['2 Nabye Omgewing', '## Nabye omgewing'],
    ['3 Evangelisasie in die buiteland', '## Buiteland'],
    ['4 Bybelverspreiding', '## Bybelverspreiding'],
    ['"Bid Vir Vyf"', '"Bid vir vyf"'],
    ["\n'n klankopname", "\n\nKlankoordenkings: 'n Klankopname"],
    ['twee-weekliks', 'tweeweekliks'],
    ['Daar kan na die opnames geluister word deur op die volgende skakel te klik:', 'Luister na die opnames deur op die skakel te klik:'],
    ["Tweedehandse verkopings: Die hele gemeente is by hierdie projek betrokke deurdat hulle 'n geleentheid kry om hul tweedehandse ware soos klerasie, kombuisware, bedlinne en gordyne te skenk. Die ware word dan een keer per maand te koop aangebied aan mense in die omgewing van die kerk asook inwoners se werkers. Die ware word spotgoedkoop aangebied en die verkoping is dus eintlik 'n uitreik na hierdie mense om Jesus se liefde te vertoon. Die opbrengs van die verkopings word gebruik om nuwe Bybels in al die landstale mee aan te koop. Die Bybels word dan by die volgende maand se verkoping aangebied teen 'n nominale bedrag.", "Tweedehandse verkopings: Die hele gemeente is by hierdie projek betrokke deurdat hulle tweedehandse items soos klerasie, kombuisware, bedlinne en gordyne kan skenk. Die ware word een keer per maand aan mense in die omgewing van die kerk asook hul werkers te koop aangebied. Omdat die ware teen baie billike pryse aangebied word, is die verkoping eerder 'n uitreik na mense om Jesus se liefde te vertoon. Die opbrengs uit die verkopings word gebruik om nuwe Bybels in al die landstale aan te koop. Die Bybels word weer by die volgende maand se verkoping aangebied teen 'n nominale bedrag."],
    ['maandellikse', 'maandelikse'],
    ['kom lidmate saam op die grasperk voor die kerk en elkeen bring sy piekniekmandjie saam', "kom lidmate op die grasperk voor die kerk byeen met 'n piekniekmandjie"],
    ['So het daar al heelwat besoekers', 'Só het daar al heelwat besoekers'],
    ['GK Pretoria Noord', 'GK Pretoria-Noord'],
    ['Mmakau omgewing', 'Mmakau-omgewing'],
    ['het GK Pretoria-Annlin saamgewerk met GK Magalieskruin en GK Pretoria-Noord en evangelisasiewerk gedoen in die Mmakau-omgewing. Eredienste in die gebied is gehou', 'het GK Pretoria-Annlin met GK Magalieskruin en GK Pretoria-Noord saamgewerk en evangelisasiewerk in die Mmakau-omgewing gedoen. Eredienste is in die gebied gehou'],
    ["saamgewerk met GK Pretoria-Annlin om nog 'n gemeente te plant in die nuut ontwikkelde gebied van GaRankuwa (Zones 20, 23, 24 en 25)", "met GK Pretoria-Annlin saamgewerk om nog 'n gemeente in die nuut ontwikkelde gebied van GaRankuwa (Zones 20, 23, 24 en 25) te plant"],
    ['HOP huise', 'HOP-huise'],
    ['dissiples', 'dissipels'],
    ['geloots', 'geloods'],
    ['teikegebiede', 'teikengebiede'],
    ['Annlin gemeente', 'Annlin-gemeente'],
    ['klik:[Uitreike.]', 'klik: [Verslae oor uitreike na Mosambiek]'],
    ["Benewens die kursus verleen die Annlin-gemeente ook hulp aan 'n aantal predikante om te oorleef in armoedige omstandighede. Ander gereformeerde gemeentes van die GKSA dra ook by tot hierdie doel en hul fondse word versigtig namens hulle bestuur deur die Annlin Kerkkantoor.", "Benewens die kursus verleen die Annlin-gemeente ook hulp aan 'n aantal predikante om in die armoedige omstandighede wat in die land heers te oorleef. Ander Gereformeerde gemeentes van die GKSA dra ook by tot hierdie doel en hul fondse word noukeurig deur die Annlin-kerkkantoor namens hulle bestuur."],
    ['Daar is ook opleiding verskaf aan Mosambiekse ouderlinge en predikante en twee word dan uitgekies om uitgestuur word vir 6-8 weke om die Woord te gaan verkondig', 'Opleiding word ook aan Mosambiekse ouderlinge en predikante verskaf waarna twee uitgekies word om vir 6-8 weke die Woord te gaan verkondig'],
    ['finansier dan die reiskoste', 'finansier die reiskoste'],
    ['waarvandaan hulle kan opereer', 'waarvandaan hulle kan werk'],
    ['Bybels in verskeidenheid van tale:', "Bybels in 'n verskeidenheid van tale:"],
    ['Heidelbegse', 'Heidelbergse'],
    ['Suid Afrika', 'Suid-Afrika'],
    ['oudio opname', 'oudio-opname'],
    ['ongetetterdes', 'ongeletterdes'],
    ["'n selfoon toepassing is onwikkel", "'n Selfoontoepassing is ontwikkel"],
    ['Android selfoon', 'Android-selfoon'],
    ['iPhone selfone', 'iPhone-selfone'],
    ['Appstore', 'App Store'],
    ['Playstore', 'Google Play'],
    ['Lomwe taal', 'Lomwe-taal'],
    ['Lomwe bybel', 'Lomwe-bybel'],
    ['via jou epos .', 'per e-pos.'],
  ],
}

const headings = new Set([
  'Visie', 'Missie', 'Ons visie', 'Ons missie', 'Groepsamestelling', 'Groep se samestelling',
  'Tipiese sake waarvoor voorbidding gedoen word', 'Hoe daar te werk gegaan word',
  'Toekomstige doelwitte', 'Wil jy graag betrokke raak by die Gebedsbediening?',
  "Het jy 'n gebedsversoek?", "Weet u dalk van medelidmate wat 'n besoek benodig?",
  'Kleuterbediening', 'Katkisasie', 'Jeugaksies', 'Laerskooljeug', 'Middelskooljeug',
  'Hoërskooljeug', 'Studente- en jongmensegroep', 'Ons roeping', 'Doelwitte', 'Ons werkswyse',
  'Diensgroep se verantwoordelikheid', 'Vertakkings van evangelisasie',
  'Wat doen ons gemeente t.o.v. evangelisasie?', 'Mmakau', 'Huidige aktiwiteite:',
])

const listPrefixes: Record<string, readonly string[]> = {
  'seniors-2': ['Seniors gereeld', 'Behoeftes te bepaal', 'Fisiese versorging', 'Vervoerreëlings', 'Inkopies', 'Doktersbesoeke', "Opstel van 'n databasis"],
  gebedsgroepe: ['Predikante en', 'Siek lidmate', 'Geestelike groei', 'Alle kerklike', 'Ander gemeentes', 'Die gemeenskap,', 'Knellende probleme', 'Wêreldgebeure', 'Voorbidding word', 'Gebedsversoeke word', 'Spesiale gebedsgeleenthede', 'Daar word gepoog', 'Dat die gemeente', 'Dat elke lidmaat', 'Dat gebed'],
  jeugbediening: ['18 maande', 'Graad RR', 'Graad 2 en 3'],
  'tweedehandse-goedere-verkopings': ['Om die evangelie', 'Om bybels', 'Om die werkersgemeenskap', 'Om fondse', 'Om klerasie'],
  'evangelisasie-blad': ['Beplan aksies', 'Lei lidmate', 'Organiseer', 'Inisieer', 'Motiveer lidmate', 'Koördineer', 'Finansiëring', 'Verskaf hulpbronne', 'Fasiliteer geestelike', 'Terugvoer aan', 'Ongeveer 5 uit', 'Jong predikante', 'Daar tans minder'],
}

const labels: Record<string, readonly string[]> = {
  jeugdiensgroep: ['Laerskool', 'Hoërskool', 'Naskool'],
  'sosiale-dienste': ['Nagmaaletes', 'Kom Kuier na Kerk (KKnK)', 'Gemeentekamp', 'Ad hoc-geleenthede'],
  'evangelisasie-blad': ['Bid vir vyf', 'Praat oor Jesus', 'Klankoordenkings', 'Tweedehandse verkopings', 'Kersliedere by kerslig', 'Kerkplanting in eie omgewing', 'Word deel van Crossroads Prison Ministries', 'Ondersteuning aan Disciples Go Ministries (DGM) en Training of Pastors in Africa (TOPIA)', "Bybels in 'n verskeidenheid van tale", 'Heidelbergse Kategismus'],
}

const captions = new Set([
  'Vanjaar se kategete', "Suster Rita Kruger en haar span besig om tydens 'n kerkkamp te bedien.",
  'Ds Attie Venter en suster Marietjie van der Walt agter die bybeltafel.',
  'Om vrymoedig te kan praat oor Jesus', "'n Tipiese maandelikse tweedehandse verkoping",
  'Uitreik na gemeente in 2015', '2025 - Bygewoon deur 33 predikante en kerkleiers',
  'Bybelverspreiding oor die afgelope aantal jare.',
])

export function reviseGroupDescription(slug: string, source: string): string {
  let value = source
  for (const [old, replacement] of replacements[slug] ?? []) value = value.replaceAll(old, replacement)
  value = value.replace(/^\s*Ons Visie\s*$/gm, 'Ons visie').replace(/^\s*Ons Missie\s*$/gm, 'Ons missie')
  const paragraphs = value.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean)
  return paragraphs.flatMap((paragraph) => {
    if (slug === 'gebedsgroepe' && paragraph === 'Daar word onder andere voorbidding gedoen vir:') return []
    if (headings.has(paragraph)) return [`### ${paragraph}`]
    if (captions.has(paragraph)) return [`*${paragraph}*`]
    if (slug === 'evangelisasie-blad' && ['Eie omgewing', 'Nabye omgewing', 'Buitelands', 'Bybelverspreiding'].includes(paragraph)) {
      return [`- ${paragraph === 'Buitelands' ? 'Buiteland' : paragraph}`]
    }
    const label = labels[slug]?.find((item) => paragraph.startsWith(`${item}:`))
    if (label) return [`- **${label}:**${paragraph.slice(label.length + 1)}`]
    if (listPrefixes[slug]?.some((prefix) => paragraph.startsWith(prefix))) {
      return [`- ${paragraph.replace(/[.;]$/, '')}.`]
    }
    return [paragraph]
  }).join('\n\n').replace(/(^- [^\n]+)\n\n(?=- )/gm, '$1\n') + '\n'
}
