<!-- /autoplan restore point: /home/pieter/.gstack/projects/cyrus-za-annlin-website/main-autoplan-restore-20260915-140117.md -->
# Taak- en voorstelstelsel

> Die geïmplementeerde domein heet `Task`; ’n voorstel is slegs een bron van ’n taak. Gebruik die huidige `tasks`-kode en Prisma-skema as gesaghebbend wanneer hierdie oorspronklike ontwerpnotas en die implementering verskil.

## Doel

Gee aangemelde gebruikers 'n eenvoudige plek om verbeterings voor te stel, met 'n gesprek en sigbare vordering. Gee administrateurs 'n basiese Kanban-bord om versoeke te beoordeel, te prioritiseer, te bespreek en deur die werkvloei te beweeg.

## Gebruikerservaring

- Wys 'n diskrete, toeganklike terugvoerknoppie regs onder op publieke én adminbladsye, maar slegs wanneer `useSession` 'n aangemelde gebruiker bevestig. Verberg dit op auth-bladsye.
- Die knoppie is `Voorstelle`, nie 'n generiese live-chat-ikoon nie. Dit open een paneel met drie wedersyds uitsluitende skerms: `My voorstelle`, `Nuwe voorstel` en `Gesprek`.
- 'n Nuwe versoek vra vir 'n kort opskrif en beskrywing, en bêre die huidige bladsy se pad as nuttige konteks.
- Die gebruiker kan opvolgboodskappe plaas en status, prioriteit, verantwoordelike persoon en tydstempels sien.
- Wys 'n klein ongelees-aanwyser op die drywende knoppie en by gesprekke wanneer iemand anders sedert die gebruiker se laaste gesiene aktiwiteit 'n boodskap of sigbare werkvloeiverandering gemaak het. Die getal verteenwoordig gesprekke, nie boodskappe nie.
- Gewone gebruikers sien slegs hul eie versoeke. Administrateurs sien alle versoeke en kan op enige gesprek antwoord.
- Administrateurs kan in die paneel tussen `My voorstelle`, `Alle voorstelle` en `Ongelees` kies. Die admin se knoppietelling dek alle versoeke waartoe hulle toegang het; nuwe versoeke van ander gebruikers tel ook as ongelees.
- Geen terugvoer-UI of data is publiek beskikbaar nie. 'n Latere publieke uitrol is uitdruklik buite hierdie weergawe.

## Adminervaring

- Voeg `Voorstelle` by die adminsybalk, slegs vir administrateurs.
- Wys 'n responsiewe Kanban-bord met die fases `Nuut`, `Beplan`, `Besig`, `Wag vir terugvoer`, `Voltooi` en `Gekanselleer`.
- Elke kaart wys opskrif, indiener, prioriteit, laaste aktiwiteit en boodskaptelling.
- 'n Detaildialoog wys die volledige gesprek en laat die admin antwoord, prioriteit/verantwoordelike persoon kies en die status verander.
- Gebruik eksplisiete statuskeuses en skuifaksies eerder as slegs sleep-en-los, sodat sleutelbord-, raakskerm- en ouer gebruikers dieselfde funksionaliteit kry.
- Hou geslote versoeke deur filters beskikbaar, maar vou `Voltooi` en `Gekanselleer` by verstek uit die aktiewe werkbeeld. Geen harde verwydering in die eerste weergawe nie.
- Gebruik vier aktiewe kolomme (`Nuut`, `Beplan`, `Besig`, `Wag vir terugvoer`) en 'n afsonderlike `Gesluit`-aansig vir `Voltooi` en `Gekanselleer`. Op nouer skerms word dit 'n gefiltreerde vertikale lys; op wye skerms kan die admin tussen `Bord` en `Lys` kies.

## Datamodel en magtiging

### Modelle

- `Task`: `requesterId`, opsionele admin-`assigneeId`, titel, beskrywing, opsionele relatiewe `pagePath`, bron, status, prioriteit, `workflowVersion`, `activitySeq`, `lastActivityAt`, opsionele `closedAt`, `creationKey` en `creationPayloadHash`.
- `TaskActivity`: onveranderlike gebruiker-sigbare tydlyn met `requestId`, `actorId`, per-taak `seq`, soort `CREATED | MESSAGE | WORKFLOW`, opsionele gewone teks, opsionele gestruktureerde werkvloeiverskil, `operationKey`, `payloadHash` en tydstempel. Die aanvanklike beskrywing tel nie as 'n boodskap nie; die boodskaptelling tel slegs `MESSAGE`-inskrywings.
- `TaskReadReceipt`: `requestId`, `userId` en monotone `lastReadSeq`, uniek per gebruiker en taak.
- Statusse: `NEW`, `PLANNED`, `IN_PROGRESS`, `WAITING_FOR_FEEDBACK`, `DONE`, `CANCELLED`. Prioriteite: `LOW`, `NORMAL`, `HIGH`, `URGENT`; nuwe take begin by `NORMAL`.
- Uniekheid: `(requesterId, creationKey)`, `(requestId, seq)`, `(requestId, actorId, kind, operationKey)` en `(requestId, userId)`.
- Indekse: versoeke op `(requesterId, lastActivityAt, id)`, `(status, lastActivityAt, id)` en `(lastActivityAt, id)`; aktiwiteit op `(requestId, seq)`; kwitansies op `(userId, requestId)`.
- Gebruik eksplisiete vreemde-sleutelaksies. Versoeker-, outeur- en verantwoordelike geskiedenis mag nie deur harde gebruikersverwydering verdwyn nie; bestaande sagte anonimisering bly die gebruikerslewensiklus. Slegs aktiewe `ADMIN`-gebruikers is in die eerste proeflopie geldige verantwoordelike persone.

### Toegangsmatriks

| Operasie | `EDITOR` | `ADMIN` |
|---|---|---|
| Skep | As hulself | As hulself |
| Lys/detail/tydlyn/kwitansie | Slegs eie versoeke | Alle versoeke |
| Ongeleestelling | Slegs eie versoeke | Alle toeganklike versoeke, ook gesluit |
| Werkvloei/prioriteit/toewysing | Verbied | Toegelaat |
| Verantwoordelike-opsies | Nie nodig nie | Minimum aktiewe-admin-projeksie |

- Elke diensfunksie dwing self die matriks af; `requesterId`, `actorId` en kwitansie-`userId` kom uitsluitlik uit die sessie.
- Bind aktiwiteit- en kwitansie-identifiseerders aan die reeds gemagtigde ouerversoek, en filtreer aggregasies vóór telling. Afwesige en ontoeganklike rekords lewer dieselfde `404` sonder metadata.
- Beskerm `/admin/voorstelle` bedienerkant met `requireAdmin`; sybalksigbaarheid is nie magtiging nie. API-roetes gebruik 'n API-geskikte sessiehelper wat `401/403/503` onderskei eerder as 'n redirect.
- Persoonlike response is `private, no-store`. Mutasies vereis dieselfde-oorsprong `Origin` wanneer teenwoordig en `application/json`; Better Auth se auth-roetebeskerming word nie as CSRF-beskerming vir pasgemaakte roetes aanvaar nie.
- Valideer bedienerkant: titel 1-160 getrimde karakters; beskrywing/boodskap 1-10 000; opsionele `pagePath` is 'n relatiewe pad van hoogstens 500 sonder query/hash; bladsygroottes is positiewe heelgetalle met harde maksimums; weergawes/volgordes is nie-negatief; mutasies aanvaar slegs eksplisiet toegelate velde en onderskei `null` van weggelaat.
- Valideer die resulterende werkvloei: `PLANNED`/`IN_PROGRESS` behou 'n geldige verantwoordelike persoon. Render alle gebruikerinhoud as gewone teks, nooit uitvoerbare HTML of Markdown nie.

### Ongelees-kontrak

Vir gebruiker `u` is versoek `r` ongelees wanneer `u` toegang het en daar minstens een aktiwiteit deur iemand anders bestaan met `seq > COALESCE(lastReadSeq, 0)`. Die telling is dus gesprekke, nie aktiwiteite nie.

```text
Clarissa skep seq 1                 -> Pieter: ongelees; Clarissa: gelees
Pieter antwoord seq 2 sonder lees  -> Pieter: steeds ongelees; Clarissa: ongelees
Pieter sien deur seq 2             -> Pieter: gelees; Clarissa: ongelees
Clarissa sien deur seq 2           -> albei: gelees
Pieter verander prioriteit seq 3   -> Pieter: gelees; Clarissa: ongelees
Clarissa se laat ack vir seq 2      -> Clarissa: steeds ongelees vir seq 3
```

- Ken volgordenommers toe deur die versoekry binne dieselfde skryftransaksie te verhoog. Hou `workflowVersion` apart sodat 'n nuwe boodskap nie 'n adminvorm onnodig ongeldig maak nie.
- 'n Detailrespons gee die presiese gelewerde `throughSeq`. 'n Kwitansie mag slegs daardie waarde erken en werk `lastReadSeq = max(bestaande, erken)` by; dit mag nooit die bediener se huidige “nuutste” op ontvangstyd gebruik nie.
- Met tydlynpaginering erken die kliënt slegs 'n aaneenlopende reeks wat werklik gewys is. Eie stuuraksies skuif nie die kwitansie nie. Nuwe admins sonder 'n kwitansie sien historiese aktiwiteit deur ander as ongelees; dit is aanvaarbaar vir die klein proefargief.

## Tegniese vorm

- Hou databasislogika en toegangsreels in `lib/services/tasks.ts`; API-roetes bly dun.
- Gebruik bestaande Better Auth, Prisma, Radix Dialog, knoppies, badges, selects, textareas en toast-patrone; voeg geen produksie-afhanklikheid by nie.
- Plaas dieselfde gebruiker-widget in die publieke en adminlayouts. Die sessiekontrole is die bron van waarheid; moenie enige terugvoerdata in die publieke HTML bedien wanneer daar geen sessie is nie.
- Gebruik gefokusde API-roetes vir opsomming/lyste, skep, detail/tydlyn, werkvloei, boodskappe en leeskwitansies. Alle response gebruik stabiele Afrikaanse foutkodes/boodskappe en begrensde DTO's; geen rou Prisma-rekords nie.
- Een herbruikbare kliëntbeheerder per gemonteerde layout besit sessie-geskoepte data, konsepte, hangende operasies, in-vlug deduplisering, polling en verouderde-responsverwerping. Widget en bord deel die gesprekkomponent; hulle begin nie onafhanklike pollers in dieselfde boom nie.
- Verfris opsomming én die sigbare lys/gesprek ná sessiebevestiging, vensterfokus, herverbinding en elke 60 sekondes terwyl die dokument sigbaar is. Gebruik jitter, begrensde terughou en geen polling vir versteekte dokumente nie; geen websocket/realtime-infrastruktuur in hierdie weergawe nie.
- Lys versoeke met cursorpaginering van 20; die bord haal hoogstens 25 per status met afsonderlike tellings/laai-meer; die tydlyn haal hoogstens 100 inskrywings per aaneenlopende `seq`-bladsy. Sorteer deterministies op `(lastActivityAt, id)` en tydlyn op `seq`; kwitansies verander nooit `lastActivityAt` nie.
- Werk die produksiedatabasis met die nuwe Prisma-skema by voor die UI ontplooi word.

### Mutasie- en transaksiekontrak

- Skepping skryf versoek + `CREATED`-aktiwiteit atomies. Boodskappe en werkvloei skryf die versoekvolgorde/aktiwiteit en die operasionele `AuditLog` binne dieselfde Prisma-transaksie; moenie die huidige fout-insluk `createAuditLog`-helper of generiese blinde skryfherprobeerder hiervoor gebruik nie.
- Werkvloei-opdaterings vergelyk `workflowVersion`, valideer die volledige resulterende toestand, verhoog die weergawe en skryf werklike voor/na-waardes. 'n Mislukte ouditrol rol die werkvloeiaksie terug.
- Die drie-item-`Besig`-perk is 'n sigbare WIP-riglyn, nie 'n harde databasis-invariant nie. Wanneer drie reeds besig is, waarsku die UI en vra doelbewuste bevestiging; die bediener oudit die oorskryding maar blokkeer nie 'n geldige vierde item nie.
- Bewaar operasiesleutel en genormaliseerde payload-hash saam met die konsep vóór stuur. Dieselfde geskoepte sleutel + dieselfde payload lewer die oorspronklike suksesresultaat; dieselfde sleutel + ander payload lewer `409`; gelyktydige identiese versoeke skep een effek. 'n Replay kontroleer steeds huidige magtiging.
- Onderskei bevestigde sukses, bevestigde verwerping en onbekende uitkoms. Herprobeer leesversoeke vrylik; herprobeer skrywe slegs deur die idempotensiekontrak. Vee die konsep eers uit nadat die suksesresultaat plaaslik erken is.

## Toestande en reddingspaaie

- Toon duidelike laai-, leë-, fout-, indien- en suksesstate in die widget en adminbord.
- Behou een nuwe-versoekkonsep en antwoordkonsepte per gesprek in dieselfde blaaieroortjie, geskopeer volgens aangemelde gebruiker. Sluit, Terug, navigasie of heraanmelding mag dit nie verloor nie; vee dit slegs ná bevestigde sukses, eksplisiete weggooi of afmelding uit.
- Verwerp leë/te lang inhoud, onbekende statusse, nie-bestaande verantwoordelike persone en ongemagtigde rekordtoegang.
- Gebruik kompakte lyste op selfoon; Kanban-kolomme mag op groter skerms horisontaal rol, maar selfoongebruikers kry statusfilters en 'n vertikale kaartlys.
- Merk 'n gesprek eers as gelees nadat die nuutste aktiwiteit wat werklik gelewer en gerender is, aan die aktiewe gebruiker gewys is. Die oopmaak van 'n lys merk niks as gelees nie; 'n mislukte kwitansie behou die aanwyser en herprobeer sonder om boodskapstuur te blokkeer.
- Skepping en boodskappe is idempotent. As stuur slaag maar die daaropvolgende verfrissing misluk, sê die UI `Antwoord gestuur. Die lys kon nie verfris word nie.` en herprobeer slegs die leesversoek.
- Gebruik 'n rekordweergawe vir administratiewe veranderings. 'n Verouderde stoor wys `Hierdie voorstel is intussen verander`, behou die admin se voorgenome waardes en laat hulle teen die nuutste rekord besluit.

## Presiese interaksiekontrak

```text
Voorstelle-knoppie
  -> My voorstelle / Alle voorstelle / Ongelees
       -> Nuwe voorstel -> bevestigde skepping -> Gesprek
       -> Kies bestaande voorstel -------------> Gesprek
  -> Bestuur voorstelle -----------------------> Adminbord

Adminbord (wyd): Nuut | Beplan | Besig | Wag vir terugvoer
Adminbord (nou): Statusfilter + vertikale lys
Gesluit: Voltooi | Gekanselleer
```

- Die lys prioritiseer titel, status, `Ongelees`/nuutste antwoord en laaste aktiwiteit. Prioriteit, verantwoordelike persoon en boodskaptelling is sekondêr.
- Die gesprek wys titel en status, oorspronklike beskrywing, chronologiese boodskappe/werkvloei-inskrywings en die antwoordveld. `Enter` skep 'n nuwe reël; slegs die sigbare knoppie stuur.
- Terugkeer behou die vorige filter en rolposisie. 'n `Nuwe antwoorde`-skeiding en sprongknoppie voorkom geforseerde rol wanneer iemand ouer boodskappe lees.
- `Beplan` en `Besig` vereis 'n verantwoordelike persoon. Ander beplanningsveranderinge stoor onmiddellik en die stelsel skryf self die werkvloei-inskrywing. `Gekanselleer` lyk neutraal, nie destruktief nie.
- 'n Vierde item na `Besig` wys 'n WIP-waarskuwing en verg eksplisiete bevestiging; dit skuif geen ander item outomaties nie. 'n Antwoord op 'n geslote gesprek heropen dit nie outomaties nie, maar stel admins in kennis.
- Onder 640 px is die paneel volskerm met veilige-area-spasiëring, vaste kop, een rolbare inhoudsgebied en 'n bereikbare antwoordvoet bo die sagte sleutelbord. Vanaf 640 px is dit 'n begrensde paneel van ongeveer 560 px.
- Alle kontroles het minstens 44 x 44 px raakareas. Fokus beweeg na die nuwe skerm se opskrif, keer betekenisvol terug, en dinamiese laai-/stuur-/foutstate word bondig aangekondig sonder om die hele gesprek te herlees.
- Gebruik Source Sans, minstens 16 px vir boodskap- en vormteks, 14 px vir sekondêre metadata, statuswoorde saam met kleur, verminderde beweging, en meet 4.5:1 teks- en 3:1 kontrolekontras in al vyf temas.
- Hou die bestaande kontaknavraagklokkie apart. Plaas toasts bo die knoppie, versteek die knoppie terwyl sy paneel oop is, en definieer paneel/select/toast-lae sodat geen portaal onder 'n ander beland nie.

### Toestandteks

| Toestand | Sigbare reaksie |
|---|---|
| Eerste laai | `Laai voorstelle...`; geen kortstondige leë toestand nie |
| Geen versoeke | `Jy het nog geen voorstelle ingedien nie` + `Nuwe voorstel` |
| Filter leeg | `Geen voorstelle pas by hierdie filter nie` + `Wys alles` |
| Eerste lees misluk | Permanente fout + `Probeer weer` |
| Agtergrondverfrissing misluk | Behou vorige data, merk dit moontlik verouderd, bied herlaai |
| Stuur besig | `Stuur tans...`; behou teks en voorkom duplikaataksie |
| Skepping suksesvol | Open die gestoorde gesprek met `Voorstel ontvang` en `Nuut` |
| Sessie verval | Behou konsep, vra vir heraanmelding en keer na dieselfde skerm terug |

Naby die nuwe vorm staan: `Pieter hersien voorstelle weekliks. Antwoorde verskyn hier.`

## Verifikasie

- Gebruik 'n geïsoleerde Neon-toetstak met 'n eksplisiete toetsdoelwag. Voeg 'n liggewig integrasieskrip by wat slegs toetsbesitte data skep en altyd opruim.
- Dek skepping, eienaarskap-isolasie, adminlys, twee onafhanklike admin-kwitansies, eie-antwoord-volgorde, laat kwitansies, statusvereistes, verouderde weergawes, idempotente gelyktydige herhaling, veranderde-payload-`409`, verbode toegang en geïnjekteerde transaksiefoute.
- Toets HTTP-kontrakte deur die proxy en roetes: anoniem/eienaar/ander gebruiker/admin, geneste ID's, gefiltreerde tellings, oorsprong-/inhoudstipebeleid, `private, no-store`, begrensde paginering en neutrale `404`.
- Gebruik 20 sigbare gesimuleerde personeel-oortjies, 10x die proef-fixture en een lang gesprek om poll-deduplisering, navraagtelling, payloadgrootte en eindpuntlatensie te meet. Geen verborge-dokument-polling nie.
- Laat Vercel die TypeScript-/Next.js-produksiebou doen; moenie plaaslik `next build`, `next dev` of `tsc` loop nie.
- Toets op die Vercel-voorskou met gstack op 320 px, 390 px, tablet en rekenaar: sigbaarheid slegs wanneer aangemeld, twee rekeninge, nuwe versoek, gesprek, onafhanklike ongelees, adminbord, statusverandering, konsep-herstel, fout-/leë state, sleutelbord/fokus/zoom, sagte sleutelbord, vyf temas, oorvloei en konsole-/netwerkfoute.
- Herhaal 'n produksierooktoets en bevestig dat gewone gebruikers nie ander gebruikers se versoeke deur API-identifiseerders kan lees of wysig nie.

### Ontplooiing en terugrol

1. Berei die toevoegende Prisma-skema voor en inspekteer die presiese databasisverskil; moenie onverwante drift aanvaar nie.
2. Pas dit op die geïsoleerde Neon-toetstak toe en slaag integrasie-, gelyktydigheids- en HTTP-toetse.
3. Laat Vercel die presiese commit bou en verifieer die voorskou teen die toetstak.
4. Bevestig die produksieteiken en pas die beoordeelde toevoegende skema een keer toe vóór die produksiekode aktief is.
5. Ontplooi, verifieer die presiese Vercel-commit, rooktoets met aangemelde rekeninge en begin die proeflopie.

Terugrol beteken dat die vorige toepassingcommit herontplooi word terwyl die nuwe, ongebruikte tabelle en data behoue bly. Moenie die ou Prisma-skema terugstoot en die nuwe data verwyder nie. Reeds-oop kliënte moet 'n neutrale onbeskikbaarheidsfout wys en hul konsepte behou.

## Proeflopie en bedryfsooreenkoms

- Hierdie eerste uitrol toets uitsluitlik die werkvloei tussen genooide webwerfadmins/redigeerders, aanvanklik Pieter en Clarissa. Dit bewys niks oor gemeentelede se behoefte aan 'n publieke terugvoerstelsel nie.
- Nuwe take begin in `Nuut`. ’n Item beweeg eers na `Beplan` wanneer ’n verantwoordelike persoon toegewys is.
- Hou hoogstens drie items gelyk in `Besig`. Gebruik `Gekanselleer` wanneer die span 'n taak afwys of as duplikaat sluit.
- Hersien die proeflopie ná vier weke: gebruik, tyd tot eerste antwoord, tyd tot besluit, gesprekke wat steeds handmatig elders gejaag moes word, en administrasietyd. Brei slegs uit indien opvolg aantoonbaar beter is.
- `Eerste antwoord` is die eerste boodskap deur iemand anders as die indiener; `eerste besluit` is die eerste skuif na `PLANNED`, `DONE` of `CANCELLED`. Rapporteer onbeantwoorde/onbesliste versoeke apart eerder as om hulle uit gemiddeldes te laat.
- Die proef slaag wanneer elke versoek teen die volgende weeklikse triage hersien is; Clarissa sonder afrigting kan indien, 'n antwoord vind en antwoord; geen versoek/boodskap verlore of gedupliseer is nie; handmatige opvolg teenoor die aanvangsbasis afneem; en albei gebruikers die administrasielas as aanvaarbaar beoordeel. Handmatige opvolg en administrasietyd word tydens die proef kortliks met die hand aangeteken.

## Autoplan: CEO-premisetoets

### Premisse

Pieter het hierdie premisse op `2026-09-15` goedgekeur, met die eksplisiete bevestiging dat leesstatus per gebruiker onafhanklik moet wees.

1. **Interne proeflopie eerste:** geldig. Die eksplisiete beperking tot aangemelde gebruikers hou die eerste datamodel en misbruikoppervlak klein sonder om 'n latere publieke uitrol te verhinder.
2. **'n Gesprek, nie net 'n vorm nie:** geldig en noodsaaklik. Die doel is deurlopende kommunikasie en sigbare vordering; 'n eenrigtingvorm sou die kernprobleem net na e-pos of WhatsApp terugskuif.
3. **Kanban vir administratiewe triage:** geldig vir die huidige lae volume. Die statuskolomme gee onmiddellik 'n gedeelde werkbeeld, maar mobiele gebruikers moet 'n gefiltreerde vertikale lys kry eerder as vyf saamgepersde kolomme.
4. **Ses fases is genoeg:** geldig. `Nuut`, `Beplan`, `Besig`, `Wag vir terugvoer`, `Voltooi` en `Gekanselleer` onderskei ontvangs, prioritisering, uitvoering, blokkering en 'n eerlike negatiewe besluit sonder projekbestuur-oormaat.
5. **Geen e-pos/WhatsApp in weergawe een:** aanvaarbaar mits die produk ongelees-aanwysers het en die klein personeelproef 'n weeklikse hersieningsritme volg. Sonder enige aanduiding of ritme sou die gesprek maklik stilval.
6. **Adminbeheer, eie sigbaarheid:** geldig. Alle aangemelde rolle mag voorstel en hul eie gesprekke sien; slegs `ADMIN` mag die globale bord, prioriteit, toewysing en status bestuur.
7. **Geen sleep-en-los afhanklikheid:** geldig. Eksplisiete statuskeuses werk op sleutelbord, raakskerm en vir nie-tegniese gebruikers; sleep-en-los kan later as 'n gerief bykom.

### Wat reeds bestaan

| Subprobleem | Bestaande hefboom |
|---|---|
| Aangemelde sigbaarheid | `useSession` in `components/public/Navigation.tsx` en `requireAuth`/`requireAdmin` in `lib/auth-config.ts` |
| Adminnavigasie | Rolgefiltreerde items in `components/admin/AdminSidebar.tsx` |
| Dialoog en vormkontroles | Radix-gebaseerde `Dialog`, `Select`, `Textarea`, `Button`, `Badge` en toast-komponente |
| Datatoegang | Prisma en dun API-roetes met Zod-validering en bestaande ouditlogpatrone |
| Responsiewe uitleg | Publieke layout en admin se vaste sybalk/rolbare hoofinhoud |
| Integrasieverifikasie | Bestaande selfopruimende `tsx`-skripte vir auth-, uitnodiging- en R2-kontrakte |

### Droomstaat-delta

```text
VANDAG                         HIERDIE PLAN                         12-MAANDE IDEAL
Los e-pos/WhatsApp idees  ->   Een interne gesprek + Kanban  ->   Opsionele publieke idees,
Geen gedeelde status           Eie sigbaarheid en ongelees         kennisgewings, soek/etikette,
Handmatige opvolg              Veilige admin-triage                Codex-prioritisering/integrasie
```

Die plan lewer die kernlus volledig, maar laat kanaalkennisgewings, publieke moderering, aanhangsels, stemme en agentintegrasie doelbewus vir gebruiksdata en 'n latere besluit.

<!-- AUTONOMOUS DECISION LOG -->
## Decision Audit Trail

| # | Phase | Decision | Classification | Principle | Rationale | Rejected |
|---|---|---|---|---|---|---|
| 1 | CEO | Bou 'n tweerigtinggesprek per versoek | Mechanical | Completeness | Dit is nodig vir die gebruiker se kommunikasiedoel | Eenrigting indieningsvorm |
| 2 | CEO | Voeg per-gebruiker leesstatus by | Mechanical | Completeness | In-app gesprekke sonder e-pos benodig 'n betroubare nuwe-antwoordsein | Geen kennisgewingsaanwyser |
| 3 | CEO | Gebruik ses eenvoudige fases | Taste | Explicit over clever | `Wag vir terugvoer` en `Gekanselleer` onderskei blokkering van 'n negatiewe besluit | Slegs drie fases |
| 4 | CEO | Gebruik statuskeuses voor sleep-en-los | Taste | Pragmatic | Dieselfde funksie met beter toegang en minder kompleksiteit | Sleep-en-los in weergawe een |
| 5 | CEO | Bêre onafhanklike leeskwitansies per gebruiker | Mechanical | Completeness | Een admin se leesaksie mag nooit 'n ander admin se ongelees-aanwyser skoonmaak nie | Een gedeelde `isRead`-vlag |
| 6 | CEO | Maak die widget ook binne admin beskikbaar | Mechanical | Completeness | Die proefgebruikers werk hoofsaaklik in admin en moet die korrekte bladsykonteks kan rapporteer | Slegs publieke layout |
| 7 | CEO | Voeg `Gekanselleer` en geslote filters by | Mechanical | Explicit over clever | Die werkvloei moet eerlik kan sê nee sonder om `Voltooi` te verdraai | Alle versoeke eindig as `Voltooi` |
| 8 | CEO | Behou 'n afsonderlike feature-domein | Taste | DRY | Kontaknavrae het geen gesprek/eienaar/ontwikkelingsvloei nie; hergebruik UI- en auth-patrone, nie die verkeerde datamodel nie | Brei `ContactSubmission` uit |
| 9 | CEO | Vierweke personeelproef met 'n weeklikse triageritme | Mechanical | Bias toward action | Dit laat ons lewer én meet sonder om 'n toekomstige publieke uitrol voor te gee | Oop-einde uitrol |
| 10 | Design | Laat admin-ongelees alle toeganklike gesprekke dek | Mechanical | Completeness | Nuwe Clarissa-versoeke moet vir Pieter uitvoerbaar sigbaar wees sonder om kontaknavrae te vermeng | Slegs eie versoeke in die knoppie |
| 11 | Design | Erken slegs werklik gerenderde aktiwiteit as gelees | Mechanical | Correctness | 'n Lys-oopmaak of laat netwerkantwoord mag nie ongesiene werk uitvee nie | Merk hele gesprek by lys-oopmaak gelees |
| 12 | Design | Gebruik drie aparte paneelskerms | Mechanical | Explicit over clever | Skepping, lys en gesprek kry elk een duidelike primêre taak | Alles gelyk in een klein paneel |
| 13 | Design | Bewaar konsepte per gebruiker in oortjiesessie | Mechanical | Completeness | Sluit, navigasie en heraanmelding is normale paaie en mag geen teks verloor nie | Slegs geheue- of foutbehoud |
| 14 | Design | Maak werkvloeiveranderinge onmiddellik en verstaanbaar | Mechanical | Completeness | Verantwoordelike persoon en status word sonder ’n aparte stoorknoppie bewaar | Slegs ouditlog of los statuskeuse |
| 15 | Design | Gebruik vier aktiewe kolomme en 'n aparte geslote aansig | Taste | Subtraction | Ses gelyke kolomme verswak skandering en maak aktiewe werk te nou | Alle statusse altyd op een bord |
| 16 | Design | Minimum 44 px teikens en 16 px kernteks | Mechanical | Accessibility | Dit pas die personeelgehoor en maak portaal-tipografie onafhanklik van layout-erfenis | Vertrou op bestaande standaardklasse |
| 17 | Eng | Gebruik 'n geordende aktiwiteitstroom en per-gebruiker hoëwatermerk | Mechanical | Correctness | Eie latere aktiwiteit mag nie 'n ander persoon se vroeëre ongeleesde aktiwiteit versteek nie | Tydstempel of jongste-akteur alleen |
| 18 | Eng | Skryf gebruiker-tydlyn en ouditlog afsonderlik maar atomies | Mechanical | Completeness | Die tydlyn is produkdata; die ouditlog is operasionele bewys en huidige helper sluk foute | Hergebruik ouditlog as gesprek |
| 19 | Eng | Maak drie `Besig`-items 'n waarskuwing, nie 'n harde invariant nie | Taste | Simpler over clever | 'n Globale slot is buite verhouding vir 'n twee-persoonproef en die gebruiker het nie 'n harde limiet versoek nie | Geserialiseerde globale WIP-slot |
| 20 | Eng | Maak idempotensie sleutel- én payloadbewus | Mechanical | Correctness | 'n Verlore respons of veranderde konsep mag nie duplikate of vals sukses skep nie | Unieke sleutel sonder payload-identiteit |
| 21 | Eng | Dwing magtiging in elke diensoperasie af | Mechanical | Security | Proxy en UI-sigbaarheid dek nie IDOR, aggregasies of geneste rekords nie | Slegs roete-/sybalkkontroles |
| 22 | Eng | Begrens elke lys en tydlyn met deterministiese cursors | Mechanical | Performance | Een groot navraag is steeds onbegrens en onstabiele sortering verloor/dupliseer rye | Haal die hele proefargief |
| 23 | Eng | Gebruik toevoegende skema-voor-kode ontplooiing en data-behoudende terugrol | Mechanical | Reversibility | Vercel-bou genereer Prisma maar pas geen skema toe nie | Kode eerste of ou skema terugstoot |

## Autoplan: Fase 1 CEO-resensie

### Implementeringsalternatiewe

| Benadering | Voordeel | Risiko | Keuse |
|---|---|---|---|
| Brei `ContactSubmission` uit | Minder nuwe tabelle | Meng publieke navrae met interne produkwerk; geen bestaande eienaarskap of gesprek nie | Verwerp |
| Eksterne produk soos Trello/GitHub Issues | Volwasse bord | Clarissa moet 'n tweede tegniese produk leer; gesprek/status is nie in haar bestaande werkruimte nie | Verwerp vir proeflopie |
| Afsonderlike interne feature-domein, bestaande UI/auth hergebruik | Presiese magtiging, gesprek en werkvloei; geen nuwe diens | Meer eie kode en onderhoud | Gekies |

### Tydsverloop

- **Uur 1:** skema en dienskontrakte; grootste risiko is eienaarskap- en leesstatusmagtiging.
- **Uur 2-4:** API, widget en adminbord; grootste UX-risiko is dat die gesprek en nuwe-versoekvorm te veel in een klein paneel probeer doen.
- **Uur 5+:** integrasietoets, produksieskema, Vercel-bou en twee-rekening QA; grootste uitrolrisiko is 'n suksesvolle tegniese vloei sonder 'n weeklikse triageritme.

### Afdelingsbevindinge

1. **Argitektuur:** 'n afsonderlike domein met dun roetes en 'n gedeelde dienslaag pas die repository. Die widget moet nie sy eie vertroude gebruiker-ID aanvaar nie; elke operasie lei dit uit die sessie af.
2. **Foute en redding:** alle mutasies moet herprobeerbaar wees sonder duplikaatboodskappe. Die kliënt behou teks totdat 'n suksesrespons ontvang word en wys 'n konkrete Afrikaanse fout.
3. **Sekuriteit:** IDOR is die kritieke bedreiging. Elke detail-, boodskap- en leeskwitansie-operasie moet eienaarskap of adminrol binne dieselfde bedienerfunksie afdwing; publieke/ongeverifieerde versoeke kry `401`/`404` sonder rekordmetadata.
4. **Data en interaksie:** leesstatus is per gebruiker. Die stuuraksie werk `lastActivityAt` atomies by; opening skep/werk slegs die huidige gebruiker se kwitansie by. Eie boodskappe skep nie self-ongelees nie.
5. **Kodekwaliteit:** sentraliseer statusetikette, kleure en volgorde in een gedeelde module. Moenie dieselfde toegangsreëls oor drie roetes herhaal nie.
6. **Toetse:** dek skepping, isolasie, adminoorsig, onafhanklike kwitansies vir twee admins, verbode statusverandering, boodskap-idempotensie en selfopruiming.
7. **Werkverrigting:** haal bordkaarte in een saamgestelde navraag; moenie boodskappe per kaart laai nie. Laai 'n volledige gesprek eers wanneer dit oopgaan en indekseer status/aktiwiteit, requester en message request/date.
8. **Waarneembaarheid:** oudit adminveranderings en log veilige rekord-ID/operasie by bedienerfoute, nooit boodskapinhoud of sessies nie.
9. **Ontplooiing:** skema moet vóór die kode beskikbaar wees. Die nuwe modelle is toevoegend; UI bly onsigbaar vir afgemelde gebruikers en kan veilig teruggerol word sonder dat bestaande inhoud geraak word.
10. **Lang termyn:** die personeelproef mag nie stilweg 'n lidmaatportaal word nie. Publieke toegang, moderering en nuwe authrolle vereis 'n nuwe besluit.
11. **Ontwerp:** gebruik 'n duidelike drie-vlak paneel (`My voorstelle` -> gesprek -> nuwe voorstel), nie 'n generiese chatborrel wat voorgee dat iemand onmiddellik beskikbaar is nie.

### Error & Rescue Registry

| Fout | Gebruiker sien | Redding |
|---|---|---|
| Sessie verval | `Meld asseblief weer aan` | Sluit nie getikte teks uit nie; skakel na aanmelding |
| Lys/detail misluk | Konkrete laaifout | `Probeer weer` sonder bladsyherlaai |
| Stuur misluk | Boodskap bly in invoer | Herprobeer met idempotensiesleutel |
| Rekord bestaan nie/toegang verbode | Neutrale `Versoek nie gevind nie` | Terug na eie lys; geen metadata lek nie |
| Admin kies ongeldige gebruiker/status | Veldspesifieke fout | Herlaai geldige opsies; geen gedeeltelike update nie |
| Twee admins werk gelyk | `Hierdie voorstel is intussen verander` | Verwerp verouderde adminstoor; behou voorgenome waardes teen die nuutste rekord |

### Failure Modes Registry

| Mislukking | Erns | Voorkoming/bewys |
|---|---|---|
| Een admin se leesaksie maak dit vir almal gelees | Kritiek | Saamgestelde unieke kwitansie per `requestId,userId`; twee-admin toets |
| Gewone gebruiker lees iemand anders se versoek | Kritiek | Sentrale toegangspredikaat; negatiewe diens/API-toetse |
| Boodskap word dubbel geskep op herprobeer | Hoog | Kliënt-idempotensiesleutel met unieke indeks |
| Kanban veroorsaak N+1-navrae | Medium | Saamgestelde kaartprojek­sie en gesprek-op-aanvraag |
| Geslote kaarte oorweldig aktiewe bord | Medium | Aktief by verstek; geslote filter apart |
| Niemand antwoord nie | Produkhoog | Ongeleesaanwysers, weeklikse triage en vierweke meting |

### CEO-konsensus

Claude-subagent: nie beskikbaar/nie gebruik in hierdie Codex-omgewing nie. Onafhanklike Codex het sewe bekommernisse geopper. Die primêre resensie aanvaar personeelproef-afbakening, adminwidget, eerlike sluiting, triageritme en meetkriteria; dit verwerp die voorstel om die feature-domein met kontaknavrae te vermeng.

| Dimensie | Codex | Primêre resensie | Konsensus |
|---|---|---|---|
| Premisse geldig | Voorwaardelik | Ja, met afbakening | Bevestig ná wysiging |
| Regte probleem | Herformuleer as besluit/uitkoms | Gesprek + besluit/uitkoms | Bevestig |
| Omvang | Te vroeg sonder proef | Klein personeelproef | Bevestig |
| Alternatiewe | Kontakvloei ontbreek | Vergelyk en verwerp | Bevestig |
| Risiko's | Aanneming/opvolg | Ritme + meting | Bevestig |
| Ses-maand trajek | Bord kan argief word | Geslote filter + hersieningshek | Bevestig |

### CEO-voltooiingsopsomming

Fase 1 behou die gebruiker se kernrigting, maar maak die proefpopulasie, admin-invoer, onafhanklike leesstatus, negatiewe sluiting en bedryfsverantwoordelikheid eksplisiet. Die latere ingenieursfase moet die presiese lees-, transaksie- en ontplooiingskontrakte bevestig. Oorblywende smaakbesluite is die ses statusse en die keuse om 'n afsonderlike interne domein eerder as `ContactSubmission` te gebruik.

## Autoplan: Fase 2 ontwerp-resensie

### Omvang en bestaande patrone

Die hersiene plan is `8/10` ontwerpvolledig, vanaf `6/10`: die kernreis en toestandkontrakte is nou presies, maar werklike kleurkontras en sagte-sleutelbordgedrag kan eers in die ontplooide UI bewys word. Geen `DESIGN.md` of gstack-ontwerpgenerator is beskikbaar nie; die teks-wireframe hierbo vervang dus die visuele mockup. Die implementering hergebruik `AdminPreviewDialog` se vaste kop/rolbare middel/vaste voet, die kontaknavraaglys se skandeerbare rye, bestaande Radix-fokusbeheer, vormfoute en tema-tokens.

### Ontwerpbevindinge

1. **Inligtingsargitektuur, 6 -> 9:** skepping, lys en gesprek is nou aparte skerms; primêre gebruikerstaak staan voor adminmetadata.
2. **Toestande en herstel, 5 -> 9:** eerste laai, leeg, gefiltreer-leeg, harde fout, verouderde data, stuur, sukses, gedeeltelike sukses en sessieverval het eksplisiete teks en herstel.
3. **Gebruikersreis, 6 -> 9:** die lus loop van voorstel na gesprek en sigbare uitkoms, met terugkeer, konsepbehoud en opvolg ná sluiting.
4. **AI-sjabloonrisiko, 7 -> 9:** die UI boots nie Intercom se live-support-belofte of 'n generiese seskolombord na nie; dit gebruik die gemeente se taal en bestaande CMS-patrone.
5. **Ontwerpstelsel, 8 -> 9:** bestaande komponente en tema-tokens word hergebruik; statusbetekenis is nie van die veranderlike amberkleur afhanklik nie.
6. **Responsief en toeganklik, 5 -> 9:** volskerm selfoon, begrensde rekenaarpaneel, een rolgebied, veilige-area, 44 px teikens, fokusreëls, lewendige aankondigings en kontrasdrempels is vasgelê.
7. **Onopgeloste besluite:** werklike paneelhoogte, bordbreekpunt en statuskleurkombinasies word deur produksie-QA gekalibreer; geen produkbesluit word aan die implementerder oorgelaat nie.

### Ontwerpstem-konsensus

Claude-subagent: nie beskikbaar/nie gebruik in hierdie Codex-omgewing nie. Die onafhanklike Codex-ontwerpstem het elf gapings gevind; die primêre resensie het almal in die interaksiekontrak opgeneem. Daar is geen meningsverskil wat 'n nuwe gebruikersbesluit vereis nie.

| Dimensie | Codex | Primêre resensie | Konsensus |
|---|---|---|---|
| Hiërargie | Drie wedersyds uitsluitende skerms | Aanvaar | Bevestig |
| Reis en konsepte | Sluit/navigasie/heraanmelding moet herstel | Aanvaar | Bevestig |
| Toestande | Gedeeltelike sukses en konflik ontbreek | Bygevoeg | Bevestig |
| Responsief | Volskerm selfoon, begrensde paneel | Aanvaar | Bevestig |
| Toeganklikheid | Teikens, fokus, aankondigings en kontras | Aanvaar | Bevestig |
| Repository-pas | Hergebruik patrone; los portaal-tipografie en lae op | Aanvaar | Bevestig |
| Proeflopie | Meet taakvoltooiing, nie aannemingstatistiek nie | Aanvaar | Bevestig |

### Ontwerpvoltooiing

Fase 2 maak die twee belangrikste lusse ondubbelsinnig: elke persoon se ongeleesstatus bly onafhanklik, en geen normale paneel-/navigasiepad verloor 'n konsep nie. Die aanvanklike UI kan nou sonder drag-and-drop, realtime of nuwe ontwerpafhanklikhede gebou word. Produksie-QA moet steeds die vyf temas, 320/390 px, sagte sleutelbord, zoom, skermleser en oorvleueling met toasts bewys.

## Autoplan: Fase 3 ingenieursresensie

### Omvang en bestaande hefboom

Die afsonderlike domein pas die repository, maar die bestaande `createAuditLog` en generiese databasisherprobeerder mag nie direk vir atomiese feature-mutasies hergebruik word nie: die eerste skryf buite 'n caller-transaksie en sluk foute, en die tweede kan 'n skrywe ná 'n onseker commit herhaal. Die nuwe diens gebruik eerder die uitnodigingdiens se patroon van voorwaardelike skrywe, affected-row-kontrole en afhanklike skrywes binne een transaksie.

| Subprobleem | Bestaande hefboom | Nodige grens |
|---|---|---|
| Sessies/rolle | Better Auth, `requireAuth`, `requireAdmin` | API-helper met JSON-statusse; diens dwing eienaarskap af |
| Datatoegang | Prisma en transaksies | Feature-spesifieke idempotensie; geen blinde skryfherprobeer |
| Oudit | `AuditLog`-model en konstantes | Direkte `tx.auditLog.create`; gebruiker-tydlyn bly apart |
| Admingebruikers | User-diens en rolle | Minimum aktiewe-admin-projeksie vir toewysing |
| UI | Dialog/Select/Form/Toast en twee layouts | Een beheerder per layoutboom; gedeelde gesprekkomponent |
| Verifikasie | Selfopruimende `tsx`-skripte | Geïsoleerde Neon-tak plus HTTP-, gelyktydigheids- en browsertoetse |

### Argitektuur

```text
Publieke layout / Admin layout
  -> TaskController (sessie, konsepte, polling, deduplisering)
       -> Widget: lys -> skep -> gedeelde gesprek
       -> Adminbord -> gedeelde gesprek + werkvloeiredigeerder
            -> Dun /api/tasks roetes
                 -> API-sessie + origin/content-type + no-store
                 -> tasks-diens
                      -> toegangsmatriks en resulterende-toestandreëls
                      -> idempotensie en cursorprojeksies
                      -> Prisma-transaksie
                           -> request/version/activitySeq
                           -> onveranderlike aktiwiteit
                           -> per-gebruiker kwitansie
                           -> operasionele ouditlog

Gedeelde suiwer kontrakte -> UI + API + diens
Prisma/auth             -> slegs bedienerkant
```

Die kernmodel is geskik vir die huidige volume én 10x groei. Dit voeg geen queue, websocket, cache of nuwe produksie-afhanklikheid by nie. Werkvloeiweergawe en aktiwiteitsvolgorde bly apart; dus veroorsaak nuwe gesprekke nie vals admin-konflikte nie.

### Toetsdiagram

```text
Geïsoleerde DB + toetsdoelwag
  -> Saai 2 ADMIN + 2 EDITOR toetsgebruikers
       -> Magtiging: anoniem / eienaar / ander / admin / gedeaktiveer
       -> Ongelees: skepping / eie antwoord / twee admins / laat ack / gesluit
       -> Mutasie: identiese replay / ander payload / stale version / audit failure
       -> Data: statusvereistes / cursors / lang tydlyn / deterministiese sortering
            -> HTTP: proxy / nested IDs / origin / content type / no-store / foutkodes
                 -> Vercel: build + desktop/mobile/twee-rekening browser QA
                      -> Produksie: skema -> presiese commit -> rooktoets

Elke stap faal nie-nul en verwyder slegs data met die toets se unieke merker.
```

### Ingenieursfoutregister

| Mislukking | Erns | Voorkoming/bewys |
|---|---|---|
| Eie antwoord versteek iemand anders se vroeëre ongelees | Kritiek | `EXISTS` op ander akteur ná eie `lastReadSeq`; volgordetoets |
| Laat kwitansie erken nuwer aktiwiteit | Kritiek | Erken presiese gelewerde `throughSeq`; monotone maksimum |
| Een operasie commit twee keer | Kritiek | Geskoepte sleutel + payload-hash + gelyktydige replaytoets |
| Werkvloei slaag sonder sigbare noot/oudit | Hoog | Een transaksie; geïnjekteerde ouditfout rol alles terug |
| Ander gebruiker raai 'n rekord-ID | Kritiek | Ouer-geskoepte diensmagtiging en neutrale `404` |
| Auth-/DB-fout lyk soos leë lys | Hoog | Afsonderlike onbeskikbaarheidsrespons; behou verouderde data |
| Gebruiker wissel tydens in-vlug lees | Hoog | Sessiegeskoepte toestand en stale-response verwerping |
| Lang gesprek/pollingpiek versadig DB | Medium | Cursors, deduplisering, jitter en 20-oortjie lastoets |
| Kode bereik produksie vóór skema | Kritiek | Geïnspekteerde toevoegende skema-hek vóór commit-ontplooiing |
| Terugrol wis proefdata | Kritiek | Rol toepassing terug; behou toevoegende tabelle |

### Ingenieurskonsensus

Claude-subagent: nie beskikbaar/nie gebruik in hierdie Codex-omgewing nie. Die onafhanklike Codex-ingenieursstem het tien kontrakgapings gevind. Die primêre resensie het nege direk aanvaar en een vereenvoudig: die drie-item WIP-perk bly 'n sigbare riglyn in plaas van 'n globale geserialiseerde databasis-invariant.

| Dimensie | Codex | Primêre resensie | Konsensus |
|---|---|---|---|
| Argitektuur | Goeie domein; toestandseienaar ontbreek | Gedeelde beheerder/gesprek bygevoeg | Bevestig |
| Toetse | Te algemeen | Volgorde, races, HTTP, foutinspuiting en browserhek bygevoeg | Bevestig |
| Werkverrigting | Onbegrensde lyse/polling | Cursors, per-status limiete, jitter/deduplisering | Bevestig |
| Sekuriteit | Proxy alleen onvoldoende | Volledige diensmatriks, no-store en originbeleid | Bevestig |
| Foutpaaie | Oudit/retry/idempotensie onseker | Atomiese tydlyn/oudit en payloadbewuste replay | Bevestig |
| Ontplooiing | `db push` nie deel van Vercel-bou nie | Geïnspekteerde skema-voor-kode en data-behoudende terugrol | Bevestig |

### Ingenieursvoltooiing

Die hersiene plan is implementeringsgereed: modelvelde, unieke sleutels, indekse, ongeleespredikaat, transaksiegrense, magtigingsmatriks, paginering, toetsbewys en ontplooiingsvolgorde is vasgelê. Kritieke gapings voor implementering: `0`. Die grootste oorblywende operasionele risiko is toegang tot 'n geïsoleerde Neon-toetstak; indien dit nie beskikbaar is nie, mag die produksiedatabasis nie as 'n ongemerkte toetsomgewing gebruik word nie.

## Autoplan: Fase 3.5

Fase 3.5 oorgeslaan: hierdie is 'n eindgebruiker-/CMS-funksie en stel geen ontwikkelaar-API, CLI, SDK of eksterne integrasiekontrak bekend nie.

## Kruisfase-temas

- **Onafhanklike sigbaarheid:** CEO, ontwerp en ingenieurswese stem saam dat leesstatus en toegang per gebruiker bereken moet word, nie as een globale vlag nie.
- **Eenvoudige oppervlak, sterk kern:** die UI bly 'n klein voorstel-/gespreklus, terwyl die bediener IDOR, herhaling, volgorde en gelyktydigheid eksplisiet hanteer.
- **Geen live-chat-belofte:** taal, polling en weeklikse triage stel eerlike antwoordverwagtinge sonder realtime-infrastruktuur.
- **Veilige toevoeging:** nuwe data is afgesonder, bestaande kontaknavrae bly onveranderd, en terugrol behou gesprekgeskiedenis.
- **Bewys op produksiewaardige infrastruktuur:** liggewig diens-/HTTP-toetse plus Vercel- en gstack-browser-QA vervang plaaslike swaar bouprosesse.

## Nie in omvang nie

- Publieke, anonieme versoeke.
- E-pos-, WhatsApp- of stootkennisgewings.
- Lêeraanhangsels, stemme, sperdatums, etikette of subtake.
- Sleep-en-los as die enigste manier om status te verander.
- Codex-outomatisering binne die webtoepassing; Codex-sessies kan later die bord via die databasis of 'n aparte adminhulpmiddel lees.

## GSTACK REVIEW REPORT

Status: `APPROVED` op `2026-09-15` deur Pieter
Modus: `FULL_REVIEW` (`CEO -> DESIGN -> ENG`; DX korrek oorgeslaan)

### Besluite

- `23` besluite aangeteken: `19` meganies outomaties opgelos en `4` smaakkeuses vir die finale hek.
- Geen gesamentlike modelbevinding weerspreek Pieter se verklaarde doel nie; daar is dus geen gebruikeruitdaging nie.
- Claude-subagente was nie in hierdie Codex-omgewing beskikbaar nie. Onafhanklike Codex-stemme het in al drie relevante fases geloop; die plan is gemerk as Codex-en-primêre-resensie-konsensus, nie vals tweemodelkonsensus nie.

### Smaakkeuses by die hek

1. Behou 'n afsonderlike interne voorstelle-domein; moenie kontaknavrae met produkwerk meng nie.
2. Gebruik ses statusse, insluitend `Wag vir terugvoer` en die eerlike sluiting `Gekanselleer`.
3. Gebruik eksplisiete statusaksies en geen drag-and-drop in die eerste weergawe nie.
4. Hou drie `Besig`-items as 'n waarskuwing/werkritme, nie 'n harde globale databasisperk nie.

### Implementeringstake

- [ ] Voeg Prisma-modelle, enumwaardes, relasies, unieke sleutels en indekse by.
- [x] Bou gedeelde kontrakte en die gemagtigde/transaksionele taakdiens.
- [ ] Bou private API-roetes vir opsomming, lyste, detail/tydlyn, skep, boodskappe, werkvloei en leeskwitansies.
- [ ] Bou die sessiebewuste beheerder, `Voorstelle`-widget en gedeelde gesprek-UI in publieke en adminlayouts.
- [ ] Bou `/admin/voorstelle` met responsiewe bord/lys, geslote aansig en werkvloeiredigeerder.
- [ ] Voeg liggewig integrasie-/HTTP-/lastoetse by en voer dit teen 'n geïsoleerde Neon-toetstak uit.
- [ ] Pas die beoordeelde toevoegende produksieskema toe, push die presiese commit en laat Vercel bou.
- [ ] Voltooi twee-rekening gstack-browser-QA, produksierooktoets en data-behoudende terugrolkontrole.

Toetsplan: `/home/pieter/.gstack/projects/cyrus-za-annlin-website/pieter-main-test-plan-20260915-1425.md`
