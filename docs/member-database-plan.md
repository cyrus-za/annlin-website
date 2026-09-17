<!-- /autoplan restore point: /home/pieter/.gstack/projects/cyrus-za-annlin-website/main-autoplan-restore-20260917-113249.md -->

# Annlin Lidmaatdatabasis: Proeflopieplan

Status: Office Hours en Autoplan GOEDGEKEUR; implementering gemagtig  
Datum: 17 September 2026  
Eienaar: Pieter Venter  

## Probleemstelling

Clarissa moet lidmaat-, huishouding- en wykdata in 'n stelsel onderhou wat nie haar daaglikse werkvloei voldoende ondersteun nie. Praktiese werk word verder oor Winkerk, e-pos, WhatsApp, Google Groups, CSV-uitvoere en informele opvolg versprei. Die probleem is dus nie bloot dat Annlin 'n ander databasis benodig nie; die kerkkantoor benodig een verstaanbare werkvloei waarin die korrekte rekord, die nodige opvolgtaak en die uiteindelike verslag met mekaar verbind is.

## Vraagbewys en Huidige Werkvloei

- Clarissa gebruik reeds die nuwe takebord en beskryf dit as 'n nuttige funksie.
- Sy wou self take op die volledige bord kon skep, skermgrepe kon aanheg en statusse direk bestuur; hierdie gedrag wys dat die bord reeds deel van haar werklike kantoorwerk kan word.
- Haar gereelde administratiewe werk sluit lidmaat- en wykveranderings, gemeentelike en wyksverslae en CSV-uitvoere in.
- Slegs 53 van ongeveer 530 lidmate het volgens die Julie 2026-notule suksesvol vir Winkerk geregistreer. Die gemeente se onmiddellike pyn le dus by kantooradministrasie en betroubare data, nie by die herbou van 'n volledige lidmaattoep nie.
- Die bestaande proses maak Clarissa verantwoordelik vir handmatige rekonsiliasie tussen verskillende lyste en kanale. As die nuwe module net nog 'n los databasis is, verskuif dit die werk eerder as om dit te verminder.

## Spesifieke Gebruiker en Smalste Bewys

Die eerste gebruiker is Clarissa in die kerkkantoor. Die smalste geloofwaardige bewys is nie 'n statiese registerdemo nie, maar een volledige werkvloei waarin sy:

1. 'n lidmaat vind;
2. die lidmaat se huishouding en wyk verstaan of regstel;
3. die verandering en vorige waardes in die geskiedenis kan sien;
4. 'n opvolgtaak aan die lidmaat, huishouding of wyk koppel; en
5. 'n korrekte wykslys as CSV vooraf besigtig en uitvoer.

Die bewys slaag wanneer Clarissa hierdie vloei met sintetiese data sonder tegniese hulp kan voltooi en kan aandui dat dit minder duplisering as haar huidige proses veroorsaak.

## Besluitstatus en Grense

Hierdie werk is 'n tegniese proeflopie, nie 'n goedgekeurde vervanging van Winkerk nie.

- Die Administrasie- en Kommunikasiekommissie het in Januarie 2025 besluit om Winkerk, Winkerk Online en die mobiele toepassing aan te koop.
- Die Kommunikasiekommissie het op 21 Julie 2026 die swak registrasie-uitkoms (53 van 530 lidmate), moeilike registrasie, duplisering van kommunikasiewerk en die toepassing se leemtes aangeteken.
- Daardie kommissie het uitdruklik besluit om nie self Winkerk te vervang nie en die saak te laat staan totdat verkenningsgesprekke met ds. Pieter Kurpershoek en Johan Rossouw afgehandel is.
- Johan Rossouw se konsepdiagram van 5 Augustus 2026 hou Winkerk steeds as die amptelike databasis/front-end binne die huidige gemeente-administrasieproses.
- Die nuwe funksionaliteit mag dus in produksie agter streng administrateurtoegang bestaan en deur Clarissa getoets word, maar mag nie as die amptelike bron van waarheid, lidmaatportaal of kommunikasiekanaal bekendgestel word voordat die bevoegde kerklike besluitnemers dit goedkeur nie.

## Bronvereistes

Clarissa se Junie en September 2024-korrespondensie beskryf die kernbehoeftes:

- Een gesentraliseerde databron sodat veranderinge nie handmatig oor verskillende lyste herhaal word nie.
- Gesinne/besoekpunte met 'n gedeelde adres en lidmate wat aan 'n hooflid of huishouding verbind word.
- Wyke as die belangrikste indeling, met besoekpunte wat aan wyke gekoppel kan word.
- 'n Leesbare lidmaatregister en vinnige redigering, nie slegs los detailvorms nie.
- Gefiltreerde en gesorteerde verslae, veral gemeentelys, wykslyste en susterslyste, met PDF- en CSV-uitvoer.
- Beperkte sigbaarheid: kantoor, skriba en predikant benodig breë toegang; ouderlinge en wyksusters benodig slegs die toepaslike wyk/velde.
- Volledige geskiedenis wanneer iemand vertrek, sterf, terugkeer of van status/wyk verander; heraktivering mag nie vorige inligting uitvee nie.
- Invoer vanaf die bestaande stelsel eerder as handmatige herinskrywing van elke lidmaat.
- Soekbare/filtreerbare ampte, kommissies en diensgroeptoewysings.
- Kerklike besonderhede soos aankoms, bewysstatus en vorige/latere gemeente.
- Op 'n later stadium: lidmate wat hul eie besonderhede kan nagaan en wysigings kan aanvra.

Die 2026-notules voeg hierdie probleme by:

- Registrasie moet uiteindelik sonder 'n e-posadres kan werk; selfoon- of WhatsApp-verifikasie is 'n moontlike latere kanaal.
- Die kantoor se werklading moet verminder, nie net na 'n nuwe skerm verskuif word nie.
- Dieselfde aankondiging mag nie afsonderlik vir web, WhatsApp, Google Groups en 'n toepassing herskep hoef te word nie.
- Die oplossing moet onderhoudbaar wees indien Pieter nie beskikbaar is nie.

## Produkdoel

Bou 'n veilige gemeente-administrasiemodule binne die bestaande Next.js-administrasiepaneel waarmee die kerkkantoor een korrekte lidmaatregister kan bestuur, geskiedenis kan behou en doelgerigte lyste kan uitvoer. Bewys met 'n omkeerbare proeflopie dat die module Clarissa se daaglikse werk beter as die huidige proses ondersteun, sonder om Winkerk stilweg te vervang.

## Office Hours-besluite

- Gekose benadering: 'n veilige vertikale proef, eerder as 'n minimale skyndemo of volledige administrasieplatform.
- Die eerste sny bewys lidmate, huishoudings, wyke, geskiedenis, gekoppelde take, een wykslys-CSV en 'n beperkte invoer-voorskou.
- Clarissa en Pieter is die aanvanklike proefgebruikers. Breer rol- en wyktoegang word nie geaktiveer voordat die nodige magtiging en toetsing bestaan nie.
- Clarissa kan gewone proefwysigings direk toepas; elke verandering word geoudit. Massa-invoer, groot uitvoere en sensitiewe veranderinge kry sterker bevestiging.
- Sintetiese data kom eerste. 'n Klein werklike steekproef vereis voorafgoedkeuring, toegangsbeheer, oudit, rugsteun en 'n suksesvolle invoer-drooglopie.
- Winkerk bly die amptelike bron tydens die proef en daar is geen tweerigting-sinkronisering nie.

## Benaderings Oorweeg

### A. Minimale Registerprototipe

Lidmate, huishoudings, wyke, taakskakels en een CSV met sintetiese data, maar sonder om invoer en doelgerigte magtiging te bewys. Dit lewer vinnig 'n demo, maar dra te veel sekuriteits- en migrasierisiko na later oor.

### B. Veilige Vertikale Proef - Gekies

Die volledige kernwerkvloei met doelgerigte vermoens, geskiedenis, taakskakels, een bruikbare uitvoer en 'n klein invoer-voorskou. Dit toets die produkwaarde en die riskante tegniese aannames voordat die omvang verbreed.

### C. Volledige Administrasieplatform

Alle rolle, registers, Winkerk/Doulos-invoer, verslagbouer, PDF/CSV-uitvoere en goedkeuringswerkvloei van die begin af. Dit is die volledigste eindtoestand, maar sal te veel aannames vasle voordat Clarissa die kernwerkvloei getoets het.

## Nie Doelwitte vir die Eerste Proeflopie Nie

- Geen openbare of gemeente-wye bekendstelling nie.
- Geen outomatiese skryfwerk terug na Winkerk nie.
- Geen finansies, bydraes, Pastel-vervanging of Finkerk-funksionaliteit nie.
- Geen algemene WhatsApp-, e-pos- of stootkennisgewingstelsel nie.
- Geen selfregistrasie of lidmaat-selfdiens in die eerste fase nie.
- Geen stil invoer van die volle werklike lidmaatdatabasis voordat toegang, toestemming, rugsteun en migrasieprosedures goedgekeur en getoets is nie.

## Aanbevole Tegniese Rigting

### Databasis

Gebruik die bestaande Neon PostgreSQL-databasis en Prisma-laag, maar hou lidmaatdata in duidelik begrensde tabelle en dienste.

Cloudflare bly beperk tot die bestaande `annlin-media` R2-emmer en die gemagtigde oplaai-Worker wat media daarna stroom. Dit vorm nie deel van die lidmaatdatalaag nie.

### Toegangsmodel

Moenie die bestaande `ADMIN`-rol as voldoende beskerming vir alle lidmaatdata aanvaar nie. Voeg doelgerigte vermoens en omvang by:

- Tegniese administrateur: stelselkonfigurasie en migrasies; toegang tot lidmaatdata slegs waar ondersteuning dit vereis en elke toegang word geoudit.
- Kerkkantoor: volle lidmaat- en huishoudingbestuur, invoer en goedgekeurde uitvoere.
- Predikant/skriba: toepaslike lees- en verslagtoegang; wysigingsregte volgens beleid.
- Ouderling: slegs sy toegewese wyk en slegs goedgekeurde velde.
- Wyksuster: slegs die nodige kontakvelde vir haar toegewese wyk.
- Oudit/leesalleen: verslag- en geskiedenistoegang sonder wysigings.

Magtiging moet op elke bedieneraksie en API-roete afgedwing word. Om 'n navigasieskakel weg te steek is nie toegangbeheer nie.

Die proef voeg afsonderlike lidmaatvermoens en, waar nodig, wyk-omvang by eerder as om nuwe betekenis aan die bestaande `ADMIN`- en `EDITOR`-rolle te gee. Toegang is by verstek geweier. Pieter en Clarissa kry eksplisiete proefvermoens; bestaande administrateurs erf nie outomaties lidmaattoegang nie.

## Konseptuele Datamodel

### Kernentiteite

- `Member`: persoonlike en kerklike kernbesonderhede; stabiele interne ID; aktiewe/argiefstatus is nie 'n verwydering nie.
- `Household`: gesin/besoekpunt en gedeelde kontak-/adresinligting.
- `HouseholdMember`: verhouding tot huishouding, hooflid-aanduiding en geldigheidsdatums.
- `Address`: gestruktureerde adres met bron en opsionele normalisering; vermy dat 'n adresverandering historiese rekords oorskryf.
- `Ward`: wyknaam/nommer en aktiewe tydperk.
- `WardAssignment`: lidmaat of huishouding se wyk met begin- en einddatum.
- `MinistryAssignment`: amp, wyksuster-, kommissie- of diensgroeptoewysing met tydperk.
- `MembershipEvent`: aankoms, doop/belydenis, bewys aangevra/ontvang, vertrek, terugkeer, oorlye en ander lewensiklusgebeure.
- `MemberContactPoint`: selfoon, e-pos en ander kontakkanale met verifikasie-, voorkeur- en geldigheidsmetadata.
- `MemberSourceRecord`: bronstelsel, bron-ID, invoerbondel en kontrolehash vir herhaalbare migrasies.
- `MemberChangeRequest`: latere selfdiensversoek wat deur die kantoor goedgekeur of afgekeur word voordat die register verander.
- `TaskSubject`: opsionele, getipeerde koppeling van 'n bestaande taak aan 'n lidmaat, huishouding of wyk. Die taakdiens moet die gekoppelde rekord se toegangsreels toepas en mag nie sensitiewe lidmaatdata in taakopskrifte of kennisgewings dupliseer nie.

### Klassifikasies

Beheerde waardes moet konfigureerbaar maar geoudit wees: titel, geslag, lidmaatstatus, bewysstatus, skool-/kerkgraad, verhouding, wyse van aankoms/vertrek, amp en ander plaaslike kategoriee. Onbekende invoerwaardes word in 'n uitsonderingslys geplaas; dit word nie stilweg na 'n willekeurige waarde gekarteer nie.

### Geskiedenis en Oudit

- Belangrike veranderings skep append-only domeingebeure of weergawegeskiedenis met vorige en nuwe waardes, akteur, rede, bron en tyd.
- Rekords word geaktiveer/geargiveer, nie hard uitgevee nie, behalwe waar 'n goedgekeurde privaatheidsproses dit vereis.
- Alle besigtigings van sensitiewe detail, soektogte met groot resultate, uitvoere, invoere en wysigings word geoudit.
- Ouditrekords moet nie saam met 'n gebruiker uitgevee word nie; die huidige algemene `AuditLog`-verhouding sal vir hierdie module aangepas of aangevul moet word.

## Eerste Proeflopie-ervaring

Die Office Hours-draadmodel is gestoor by `~/.gstack/projects/cyrus-za-annlin-website/designs/member-pilot-20260917/wireframe.png`. Dit toon die beoogde responsiewe register, detailpaneel, taakskakeling, geskiedenis en invoer-voorskou. Die finale UI moet die bestaande admin-ontwerptaal gebruik; die draadmodel bepaal inligtingshierargie, nie visuele afwerking nie.

### Lidmaatregister

- Tabel met vinnige soek, duidelike filters, kolomkeuse, bladsyindeling en gestoorde administrateur-aansigte.
- Filters vir status, wyk, huishouding, amp/diensgroep, ouderdomsgroep, ontbrekende data en bron-/migrasieprobleme.
- Geen sensitiewe identiteitsnommers of volledige kontakbesonderhede in die versteklys nie.
- 'n Lidmaatdetail wys kernbesonderhede, huishouding, wyk, kerklike geskiedenis, toewysings en 'n verstaanbare veranderingslyn.
- Open detail binne 'n vinnige paneel of dialoog eerder as om die gebruiker vir elke rekord na 'n nuwe bladsy te stuur.
- Wys oop take wat aan die lidmaat, huishouding of wyk gekoppel is en laat 'n gekoppelde taak vanuit die detailvloei skep.

### Huishoudings en Wyke

- Voeg 'n lid by 'n bestaande huishouding of skep 'n huishouding binne dieselfde werkvloei.
- Verandering aan 'n gedeelde adres vereis 'n eksplisiete keuse: verander die huishouding se huidige adres, skuif net hierdie lid, of skep 'n nuwe huishouding.
- Koppel huishoudings en lidmate aan wyke; outomatiese adres-na-wyk-voorstelle kan later volg nadat wykgrense en akkuraatheid beskikbaar is.

### Verslae en Uitvoer

- Voorafgedefinieerde gemeentelys, wykslys en susterslys plus 'n beperkte pasgemaakte verslagbouer.
- Die gebruiker sien presies watter velde en hoeveel mense uitgevoer gaan word voordat die lêer geskep word.
- CSV vir verdere administratiewe verwerking; toeganklike PDF vir verspreiding waar dit werklik nodig is.
- Elke uitvoer bevat datum, filters, vervaardiger en 'n vertroulikheidsmerker; elke uitvoer word geoudit.
- Fase 1 lewer slegs die wykslys-CSV met 'n voorafbesigtiging van velde en aantal rekords. Die ander verslae, PDF-uitvoer en pasgemaakte verslagbouer volg nadat hierdie vloei gevalideer is.

### Invoer en Datakwaliteit

- Begin met sintetiese data en 'n klein, uitdruklik goedgekeurde steekproef.
- Ondersteun 'n Winkerk CSV/XLSX-uitvoer en die Doulos-argief as afsonderlike bronne; moenie bronrekords blind saamsmelt nie.
- Elke invoer het `dry-run`, kolomkartering, duplikaatvoorstelle, validasiefoute, voor/na-tellings en 'n aflaaibare uitsonderingsverslag.
- Herhaling van dieselfde bondel is idempotent; dit skep nie duplikate nie.
- Geen invoer word finaal toegepas sonder 'n opsomming en bevestiging nie.

## Sekuriteit en Privaatheid

- Dataminimering: versamel slegs velde met 'n bevestigde administratiewe doel.
- Moenie sensitiewe pastorale notas, finansiele bydraes of identiteitsdokumente by die eerste module insluit nie.
- Gebruik afsonderlike produksie- en toetsdata; geen werklike lidmaatdata in voorskou-ontplooiings nie.
- Sintetiese proefdata mag in die produksietoepassing se afgeskermde proefmodule bestaan, maar moet duidelik gemerk en in een beheerde skoonmaakaksie verwyderbaar wees. Werklike toetsdata mag slegs in die goedgekeurde produksiedatalaag verskyn, nooit in Vercel-voorskoudatabasisse of Git nie.
- Vereis herverifikasie of 'n kortlewende verhoogde sessie vir groot uitvoere en hoogs sensitiewe wysigings.
- Voeg koersbeperking, anti-CSRF-beskerming waar toepaslik, veilige foutboodskappe en geen PII in toepassinglogboeke by.
- Stel 'n sessie-/toegangshersieningsproses op en verwyder toegang onmiddellik wanneer 'n amps- of werkrol eindig.
- Dokumenteer rugsteun, hersteltoetsing, dataretensie, regstelling, uitvoer en veilige vernietiging voordat werklike data die proeflopie binnegaan.
- Laat die kerk se verantwoordelike besluitnemers die POPIA-doel, regmatige verwerking, operateurs, retensie en kennisgewing aan lidmate bevestig; hierdie plan is nie regsadvies nie.

## Gefaseerde Lewering

### Fase 0: Besluite en Inventaris

- Bevestig die proeflopie se eienaar, toetsers, datatoegang en formele besluitgrens.
- Kry voorbeeld-uitvoere en 'n volledige veldinventaris uit Winkerk en Doulos sonder om dit in Git of ontwikkelingslogboeke te plaas.
- Merk elke veld: benodig, later, nie migreer nie, sensitief, bron van waarheid en toegelate rolle.
- Definieer aanvaardingstoetse saam met Clarissa op grond van werklike weeklikse take.

### Fase 1: Veilige Registerprototipe

- Skema, vermoens/omvang, oudit, huishoudings, wyke, lidmate, geskiedenis en sintetiese saaddata.
- Lidmaatregister, vinnige detail-/redigeerwerkvloei en datakwaliteit-aanwysers.
- Koppel bestaande take aan 'n lidmaat, huishouding of wyk en skep 'n taak vanuit die relevante detailvloei.
- Wykslys-CSV met voorafbesigtiging, toegelate velde en uitvoeroudit.
- Beperkte invoer-drooglopie wat rye valideer, moontlike duplikate en onbekende waardes wys, maar nog geen volledige gemeente-invoer doen nie.
- Geen invoer van die volle gemeente of gemeente-wye toegang nie.

### Fase 2: Invoer en Verslae

- Herhaalbare invoerpyplyn met dry-run en rekonsiliasie.
- Goedkeuringswaardige CSV/PDF-verslae en uitvoeroudit.
- Clarissa toets die kernwerkvloei teen 'n klein goedgekeurde datastel.

### Fase 3: Parallelle Proef

- Plaas agter 'n bediener-beheerde kenmerkvlag en eksplisiete gebruiker-toelatingslys in produksie.
- Winkerk bly die amptelike bron. Die proefmodule dra 'n permanente `PROEFLOPIE`-aanduiding.
- Gebruik periodieke leesalleen-invoere of beheerde toetsgevalle; moenie stilweg tweerigting-sinkronisering bou nie.
- Meet taaktyd, datakwaliteitsprobleme, uitvoerakkuraatheid, ondersteuning en Clarissa se werklading.

### Fase 4: Besluitpakket

- Vergelyk Winkerk en die proefmodule teen voorafbepaalde kriteria.
- Lewer migrasietellings, sekuriteits-/privaatheidskontroles, onderhoudsplan, rugsteunherstelbewys, koste en oop risiko's.
- Die Kerkraad/kommissies besluit: hou Winkerk, verleng proef, gebruik 'n hibriede proses, of keur 'n beheerde oorskakeling goed.

### Fase 5: Slegs na Formele Goedkeuring

- Beplan 'n datavries, finale invoer, rekonsiliasie en aftekening.
- Stel die bron van waarheid eksplisiet oor.
- Rol opsioneel lidmaat-selfdiens, selfoon-/WhatsApp-aanmelding en gekonsolideerde kommunikasie later uit as afsonderlike, goedgekeurde projekte.

## Aanvaardingskriteria vir die Proeflopie

- Clarissa kan 'n lidmaat en huishouding vinnig vind, verander en die geskiedenis verstaan sonder tegniese hulp.
- Clarissa kan 'n opvolgtaak aan die korrekte lidmaat, huishouding of wyk koppel en dit weer vanaf albei kante vind.
- Clarissa kan 'n wykslys vooraf besigtig en as CSV uitvoer; die aantal en velde stem met die gekose filter ooreen.
- Geen gebruiker kan data buite sy toegelate rol en wyk deur UI, API of direkte URL verkry nie.
- In Fase 1 stem die wykslys-CSV met die gekose sintetiese brondata ooreen en sluit slegs toegelate velde in. In Fase 2 geld dieselfde maatstaf vir die gemeentelys, wykslys en susterslys.
- 'n Herhaalde invoer skep geen duplikate nie; alle verwerpte of dubbelsinnige rye verskyn in 'n uitsonderingsverslag.
- Argivering en heraktivering behou vorige wyk-, huishouding-, status- en gemeentegebeure.
- Elke invoer, uitvoer, sensitiewe besigtiging en wysiging het 'n bruikbare ouditspoor.
- 'n Onafhanklike hersteltoets bewys dat die register en ouditdata herstelbaar is.
- Die proeflopie verander nie Winkerk, stuur nie boodskappe aan lidmate nie en word nie as 'n amptelike register voorgestel nie.

## Hoofrisiko's

- Onbedoelde amptelike gebruik van 'n proefstelsel skep twee botsende bronne van waarheid.
- Te growwe `ADMIN`-toegang stel alle lidmaatdata aan te veel gebruikers bloot.
- 'n Eenmalige invoer sonder bronlyne en rekonsiliasie kan stil dataverlies of duplikate veroorsaak.
- Die nabou van elke Winkerk-funksie sal fokus verloor; die eerste maatstaf is kantoorwerkvloei, nie kenmerkpariteit nie.
- 'n Gratis stelsel sonder opvolgonderhouer is 'n organisatoriese risiko al is infrastruktuurkoste laag.
- Selfoon-/WhatsApp-aanmelding en massa-kommunikasie verg afsonderlike toestemming-, misbruik-, koste- en herstelontwerp.

## Bevestigde Premisse

1. Die eerste proef bewys die kerkkantoor-register, huishoudings, wyke, geskiedenis, gekoppelde take, 'n wykslys-CSV en invoer-voorskou; dit probeer nog nie die Winkerk-lidmaattoep of alle kommunikasie vervang nie.
2. Neon/PostgreSQL bly die enkele toepassingdatabasis; Cloudflare R2 bly slegs die medialêerberging.
3. Winkerk bly die amptelike bron tydens die proef; daar is geen tweerigting-sinkronisering nie.
4. Werklike data begin met 'n klein, goedgekeurde steekproef nadat roltoegang, oudit, rugsteun en die invoer-dry-run getoets is.
5. Lidmaat-selfdiens en selfoon-/WhatsApp-verifikasie is 'n latere fase, maar die datamodel vermy keuses wat dit onnodig moeilik maak.
6. Finansies en bydraes is buite omvang.

## Oop Produkbesluite

- Wie mag die proef formeel magtig en wie mag die eerste werklike datasteekproef sien?
- Watter velde is noodsaaklik vir die eerste drie verslae, en watter velde behoort glad nie gemigreer te word nie?
- Die datamodel ondersteun 'n huishouding se gewone wyk en 'n gedateerde individuele uitsondering. Die invoer- en UI-reels vir sulke uitsonderings moet teen werklike brondata bevestig word.
- Clarissa pas gewone wysigings direk toe. Die presiese lys sensitiewe veranderinge wat tweede bevestiging vereis, moet voor werklike data goedgekeur word.
- Hoe lank moet historiese en ouditdata gehou word, veral vir oorlede/vertrokke lidmate?
- Watter onafhanklike persoon sal dokumentasie, toegang en herstel kan hanteer indien Pieter nie beskikbaar is nie?

## Die Opdrag

Kry een verteenwoordigende, geminimiseerde Winkerk-uitvoer en die huidige wykslys-formaat by Clarissa. Gebruik dit slegs om die veldinventaris, huishouding-/wykuitsonderings en die eerste CSV se aanvaardingskriteria vas te stel; voer nog geen werklike data in die toepassing in nie.

## Wat Ek Opgemerk Het

- Pieter het die langtermyn-WhatsApp-visie doelbewus buite omvang gehou totdat die kantoor se brondata en werkvloei onder beheer is.
- Hy het finansies uitdruklik uitgesluit omdat die verantwoordelikheid en risiko nie by hierdie proef hoort nie.
- Hy verkies om Clarissa iets werkends te gee waarop sy konkreet kan reageer, eerder as om nog abstrakte vergaderings van haar te vra.
- Hy het aangedring dat die tegniese proef nie die kommissie se formele besluit oor Winkerk vooruitloop nie.

## Autoplan-beoordeling

### Fase 1: Strategie en Omvang

**Modus:** Selektiewe uitbreiding. Die veilige vertikale proef bly die vaste basis; slegs werk wat die proef se veiligheid, meetbaarheid of volledige kernvloei dra, word nou ingesluit.

#### Premisse-uitdaging

Die regte probleem is nie om Winkerk tegnies na te bou nie. Dit is om Clarissa se lidmaatverwante werk vanaf 'n versoek, deur 'n betroubare rekordverandering, tot 'n bruikbare verslag in een naspeurbare vloei te laat beweeg. Indien niks gedoen word nie, bly data en opvolgwerk oor verskillende gereedskap versprei en kan die latere WhatsApp-/selfdiensvisie nie op 'n betroubare bron bou nie.

Tydens die proef beteken “korrekte register” die proef se intern konsekwente, rekonsilieerbare datastel. Winkerk bly die organisatoriese bron van waarheid totdat 'n formele oorskakeling goedgekeur is.

#### Wat Reeds Bestaan

| Behoefte | Bestaande bousteen | Besluit |
|---|---|---|
| Aanmelding en sessies | Better Auth in `lib/auth.ts` | Hergebruik; voeg lidmaatvermoens by, moenie 'n tweede identiteitstelsel bou nie. |
| Bedienermagtiging | `requireAuth`, API-roetes en taakakteurs | Sentraliseer nuwe lidmaatbeleid in een magtigingsdiens; moenie roete-vir-roete roltoetse dupliseer nie. |
| Taakwerkvloei | `Task`, aktiwiteite, leesbewyse, aanhangsels en `TaskBoard` | Hergebruik volledig; voeg veilige onderwerpkoppelings by. |
| Oudit | Algemene `AuditLog` en inhoudshersienings | Hergebruik die patroon, maar skep 'n lidmaat-ouditmodel wat akteurbehoud, lees-/uitvoeraksies en voor/na-waardes korrek dra. |
| Admin-UI | Sybalk, dialoe, tabelle, kennisgewings en onmiddellike taakstoor | Volg dieselfde visuele taal en vinnige detailpatroon. |
| Databasis en ontplooiing | Neon/PostgreSQL, Prisma, Vercel | Hergebruik; geen nuwe databasis of diens nie. |

#### Droomtoestand-delta

```text
HUIDIG
Winkerk + los uitvoere + boodskappe + handmatige opvolg
   |
   v
HIERDIE PROEF
Afgeskermde register + huishoudings/wyke + geskiedenis
   + gekoppelde take + een uitvoer + invoer-voorskou
   |
   v
12-MAANDE-IDEAAL (slegs na formele besluite)
Goedgekeurde bron van waarheid + volledige verslae + rolomvang
   + lidmaatwysigings + opsionele WhatsApp/selfdiens
```

Die plan beweeg reguit na die ideaal sonder om die organisatoriese besluit vooruit te loop. Die datamodel, magtiging, bronlyne en oudit is platformboublokke; die openbare portaal en kommunikasiekanale is nie deel van hierdie proef nie.

#### Omvangbesluite

**Aanvaar in hierdie plan:**

- Bedienerbeheerde proefvlag plus eksplisiete gebruiker-toelatingslys.
- Afsonderlike lidmaatvermoens wat by verstek toegang weier.
- Volledige kernvloei vir lidmaat, huishouding, wyk, geskiedenis, taakskakeling en een wykslys-CSV.
- Sintetiese saaddata, 'n invoer-voorskou en idempotensie-/uitsonderingstoetse.
- Meetbare proeftelemetrie sonder PII: vlooivoltooiing, foute, invoeruitsonderings en uitvoertellings.
- Rugsteun- en herstelbewys as hek voordat enige werklike steekproef ingevoer word.

**Nie in omvang nie:**

- Winkerk-skryfwerk of tweerigting-sinkronisering: skep botsende bronne van waarheid.
- Volledige Doulos-/Winkerk-migrasie: volg eers na veldinventaris en proefgoedkeuring.
- Gemeentelys, susterslys, PDF-bouer en pasgemaakte verslagbouer: Fase 2 nadat die wykslys bewys is.
- Ouderling-/wyksuster-uitrol: die model ondersteun dit, maar aktivering vereis beleid en werklike omvangtoetse.
- Lidmaat-selfdiens, WhatsApp-aanmelding en massa-kommunikasie: aparte latere produkbesluite.
- Finansies, katkisasie en pastorale notas: doelbewus buite die module se verantwoordelikheid.

#### Tydsdiepte

- **Nou:** ontwerp, sintetiese proef, vermoens, oudit en herstelbaarheid.
- **Voor werklike data:** formele magtiger, veldinventaris, retensiebeleid, rugsteunherstel en steekproefgoedkeuring.
- **Na Clarissa se toets:** meet taaktyd en datakwaliteit; pas die werkvloei aan voordat verdere verslae of gebruikers bykom.
- **Voor oorskakeling:** kort, begrensde parallelle proef met rekonsiliasie en 'n formele aftekening; geen onbepaalde dubbelinvoer nie.

#### Strategiese Mislukkingsmodusse

| Risiko | Voorkoming | Bewys |
|---|---|---|
| Proef word stilweg amptelik | Permanente `PROEFLOPIE`-merk, toelatingslys en geen Winkerk-skryfwerk | UI- en API-toetse plus kommissiebesluit voor oorskakeling |
| Clarissa kry net nog 'n los databasis | Taakskakeling en een einde-tot-einde aanvaarbare werkvloei | Waargenome gebruikstoets sonder tegniese hulp |
| Slegte brondata word “skoon” ingevoer | Voorskou, uitsonderings, bronlyne en geen stil kartering | Herhaalbare droëloop met tellings en duplikaatgevalle |
| Pieter word 'n enkele breekpunt | Herstelhandleiding, onafhanklike hersteltoets en eksplisiete opvolgeienaar | Tweede persoon voltooi hersteltoets |
| Parallelle proef duur onbepaald | Voorafbepaalde tydvak, maatstawwe en besluitdatum | Besluitpakket met hou/verleng/oorskakel/stop-uitkoms |

### Besluitoudit

| # | Fase | Besluit | Klassifikasie | Beginsel | Rasionaal | Verwerp |
|---|---|---|---|---|---|---|
| 1 | CEO | Hou die veilige vertikale proef as gekose omvang | Meganies | Fokus + volledigheid | Dit bewys waarde en die gevaarlike aannames sonder 'n voortydige platform. | Skynprototipe; volle vervanging |
| 2 | CEO | Behandel die proefregister nie as organisatoriese bron van waarheid nie | Meganies | Eksplisiet bo slim | Verwyder die kernteenstrydigheid met Winkerk se goedgekeurde status. | Stil dubbele bron |
| 3 | CEO | Sluit herstelbewys en nie-PII proefmaatstawwe by Fase 1 in | Meganies | Boil lakes | Albei is binne die direkte veiligheids- en besluitspad. | Uitstel tot oorskakeling |
| 4 | CEO | Hou alle gemeente-wye kanale en volledige verslagbou in latere fases | Smaak | Fokus as aftrekking | Dit beskerm die bewese Clarissa-werkvloei teen platformsprong. | Nou reeds uitbrei |

### Fase 2: Ontwerp en Gebruikservaring

**Aanvanklike ontwerpvolledigheid:** 6.5/10. Die draadmodel het 'n goeie kernhierargie getoon, maar die plan het nog nie alle toestande, responsiewe gedrag, redigeringsveiligheid of toeganklikheid eksplisiet gemaak nie.

**Teiken:** 'n Kalm, data-digte kantoorwerkruimte wat soos die bestaande Annlin-admin voel, nie soos 'n generiese SaaS-paneel nie. Die gebruiker moet binne vyf sekondes weet dat sy in 'n proef is, wie sy kan soek en wat die huidige filter is.

#### Inligtingsargitektuur

```text
Admin-sybalk
  └── Lidmate [PROEFLOPIE]
       ├── Register (verstek)
       │    ├── Soek + kernfilters
       │    ├── Resultate + datakwaliteit
       │    └── Gekose rekord
       │         ├── Kernbesonderhede
       │         ├── Huishouding en wyk
       │         ├── Oop take
       │         └── Geskiedenis
       ├── Huishoudings
       ├── Wyke
       └── Invoer [slegs met invoervermoe]
```

Die eerste drie sigbare prioriteite is: (1) proefstatus en huidige konteks, (2) soek/filter, en (3) die resultate. Invoer en konfigurasie bly sekonder en verskyn slegs vir gebruikers met die toepaslike vermoe.

#### Kerninteraksie

```text
REGISTER ── kies ry ──▶ DETAILPANEEL ── wysig ──▶ REDIGEERVORM
   │                         │                         │
   │                         ├── skep taak ──▶ TAAKDIALOOG
   │                         └── sien geskiedenis
   └── uitvoer ──▶ VOORSKOU ── bevestig ──▶ CSV-AFLAAI

INVOERLÊER ──▶ KARTEER/VALUEER ──▶ UITSONDERINGS
                                      └── geen toepassing in Fase 1
```

Op wye skerms bly die register links en die detailpaneel regs sodat konteks behoue bly. Op tablet word detail 'n wye syblad. Op selfoon word resultate kompakte, semantiese rye en detail 'n volskermblad met 'n duidelike terugaksie; geen horisontale tabelblaai is nodig vir die kernvloei nie.

#### Interaksietoestande

| Funksie | Laai | Leeg | Fout | Sukses | Gedeeltelik |
|---|---|---|---|---|---|
| Register | Tabel-/ryskelette met filters aktief | “Geen lidmate pas by hierdie filters nie” plus `Maak filters skoon` | Inline fout met `Probeer weer`; bestaande resultate bly indien beskikbaar | Resultate, totaal en aktiewe filters | Verouderde resultate bly sigbaar met `Verfris`-aanwyser |
| Detail | Paneelskelet met naam uit gekose ry | Geen keuse: kort wenk om 'n lidmaat te kies | Paneel toon fout en `Probeer weer`; register bly bruikbaar | Volledige afdelings en geskiedenis | Onbeskikbare afdeling word gemerk sonder om die hele rekord te verberg |
| Redigering | Stooraksie wys vordering en voorkom dubbeltik | Opsionele leë velde kry konteks, nie vals data nie | Veldfoute by velde; konflik wys nuwe bedienerwaarde en gebruiker se waarde | Bevestiging en nuwe geskiedenisinskrywing | Geen gedeeltelike databasisstoor van een vorm nie; transaksie slaag of rol terug |
| Taakskakeling | Bekende taakskep-dialoog en optimistiese kaart | Geen oop take: `Skep gekoppelde taak` | Taak bly as konsep met herprobeeraksie | Taak verskyn aan beide kante | Onleesbare gekoppelde rekord lek geen naam of detail nie |
| CSV-voorskou | Telling en kolomme word bereken | Verduidelik dat filter nul mense lewer; aflaai gedeaktiveer | Geen lêer word geskep nie; fout met korrelasie-ID | Toon velde, aantal, vertroulikheidsmerk en aflaai | Indien data sedert voorskou verander het, vereis 'n nuwe voorskou |
| Invoer-voorskou | Oplaai-/ontledingsvordering | Geen lêer gekies: verduidelik ondersteunde formaat | Ryvlak-foute en aflaaibare uitsonderings | Geldige, duplikaat- en onbekende tellings | Geldige rye word nooit stilweg toegepas terwyl uitsonderings oorbly nie |

#### Gebruikersreis

| Stap | Clarissa doen | Beoogde gevoel | Ontwerpantwoord |
|---|---|---|---|
| 1 | Open Lidmate | Georienteerd, nie mislei nie | Permanente proefmerk en huidige bronstatus |
| 2 | Soek 'n persoon | Vinnig en in beheer | Onmiddellike soek, sigbare filters en geen onnodige dashboard nie |
| 3 | Kontroleer huishouding/wyk | Vertroue in konteks | Verwante mense, bron en datakwaliteit saam gegroepeer |
| 4 | Wysig | Versigtig maar nie bang nie | Duidelike velde, eksplisiete stoor/kanselleer en konflikherstel |
| 5 | Skep opvolgtaak | Niks val tussen stelsels nie | Voorafgekoppelde taak sonder gekopieerde sensitiewe detail |
| 6 | Voer wykslys uit | Seker oor wat gedeel word | Veld-/rekordvoorskou, vertroulikheidsmerk en ouditbevestiging |

#### Visuele en Inhoudsreels

- Hergebruik die bestaande admin-sybalk, knoppies, dialoe, vormetikette en Annlin-tema; moenie 'n nuwe visuele substelsel skep nie.
- Gebruik een primere aksent en kalm neutrale oppervlaktes. Geen dashboard-kaartmosaiek, dekoratiewe gradiente, ikoonborrels of gekleurde linkerrande nie.
- Gebruik kaarte slegs vir 'n werklike afgebakende interaksie soos die detailblad of invoeropsomming; die register self bly 'n werkruimte.
- Alle gewone teks is minstens 16px met 4.5:1-kontras; sekondere metadata mag kleiner wees slegs waar dit nie taaknoodsaaklik is nie.
- Afrikaanse nutswoorde bly kort en konkreet: `Wysig`, `Stoor veranderinge`, `Kanselleer`, `Skep taak`, `Besigtig uitvoer`.

#### Toeganklikheid en Responsiwiteit

- Volledige sleutelbordnavigasie vir soek, filters, resultate, detailblad en dialoe; fokus word na die paneel verskuif en by sluiting na die oorspronklike ry herstel.
- Sigbare fokusstyle, 44px raakdoelwitte, permanente etikette en foutopsommings wat na ongeldige velde skakel.
- Semantiese tabel op groot skerms; selfoonrye behou programmatiese naam/waarde-verhoudings. Status word nooit net deur kleur gekommunikeer nie.
- `aria-live` word slegs vir betekenisvolle stoor-, fout- en resultaatstaat gebruik; dit kondig nie elke soekkarakter aan nie.
- Lang name, ontbrekende selfone, huishoudings met baie lede, 200%-zoom en stadige verbindings is verpligte QA-gevalle.

#### Ontwerpbesluite vir Finale Hek

1. **Stoorpatroon:** eksplisiete `Stoor veranderinge` vir lidmaatvorms word aanbeveel bo autosave. Dit maak 'n sensitiewe multi-veld verandering een ouditbare transaksie en bied 'n duidelike kanselleer-/konflikpad. Klein klassifikasie- of taakstatuskeuses kan steeds onmiddellik stoor.
2. **Detailpatroon:** 'n permanente sy-aan-sy detailpaneel op groot skerms, syblad op tablet en volskermblad op selfoon word aanbeveel bo 'n gesentreerde modal. Dit behou registerkonteks en skaal beter vir lang geskiedenis.

**Ontwerptelling na verskerping:** 9/10. Die finale visuele afwerking moet na implementering met produksiedata deur `/design-review` getoets word.

#### Ontwerp-litmus

| Dimensie | Voor | Ná plan | Beoordeling |
|---|---:|---:|---|
| Inligtingshierargie | 7 | 9 | Proefstatus, soek en resultate is die eerste drie prioriteite |
| Interaksievloei | 6 | 9 | Registerkonteks bly tydens detail, wysig en taakskep behoue |
| Toestandsvolledigheid | 4 | 9 | Laai, leeg, fout, sukses, gedeeltelik en konflik is gespesifiseer |
| Responsiwiteit | 6 | 9 | Desktop-paneel, tablet-syblad en selfoon-volskerm het eie gedrag |
| Toeganklikheid | 6 | 9 | Fokus, sleutelbord, zoom, etikette en raakdoelwitte is eksplisiet |
| Inhoudsduidelikheid | 7 | 9 | Kort Afrikaanse aksies en geen tegniese databasisjargon in die UI nie |
| Vertroue en veiligheid | 5 | 9 | Proefmerk, eksplisiete stoor, konflik en uitvoervoorskou verminder foute |

**Ontwerpstemkontrole:** 'n Afsonderlike Codex-oog het die kernhiërargie en eksplisiete stoorpatroon ondersteun. 'n Claude-subagent is nie in hierdie Codex-omgewing beskikbaar nie; daar is dus geen vals tweemodel-konsensus nie. Finale visuele smaak bly onderhewig aan produksie-`design-review` met Clarissa se terugvoer.

| # | Fase | Besluit | Klassifikasie | Beginsel | Rasionaal | Verwerp |
|---|---|---|---|---|---|---|
| 5 | Ontwerp | Gebruik register + responsiewe detailblad as primere werkruimte | Smaak | Hierargie as diens | Behou konteks en vermy modal-oorvloei vir lang rekords. | Altyd nuwe bladsy; groot modal |
| 6 | Ontwerp | Gebruik eksplisiete stoor vir sensitiewe multi-veld vorms | Smaak | Ontwerp vir vertroue | Maak transaksie, kansellasie en konflik vir die gebruiker verstaanbaar. | Volledige autosave |
| 7 | Ontwerp | Spesifiseer alle laai-, leë-, fout-, sukses- en gedeeltelike toestande | Meganies | Randgevalle is UX | Verhoed generiese of stil mislukkings tydens implementering. | Ad hoc state |
| 8 | Ontwerp | Geen horisontale kernregistertabel op selfoon nie | Meganies | Selfoonprioritering | Ouer gebruikers hoef nie verborge kolomme te ontdek nie. | Desktop-tabel krimp |

### Fase 3: Ingenieursontwerp

**Aanvanklike tegniese volledigheid:** 6/10. Die produkgrense en entiteite was duidelik, maar die plan het nog nie databasisbeperkings, transaksiegrense, foutkontrakte, invoerlewensiklus of die volledige magtigingstoetsmatriks vasgele nie.

**Teiken:** een begrensde lidmaatmodule wat die bestaande aanmelding, taakstelsel, Prisma- en adminpatrone gebruik, maar sensitiewe data deur een sentrale beleid, eksplisiete databasisinvariante en append-only geskiedenis beskerm.

#### Argitektuur en Vertrouensgrense

```text
Admin UI
  |  geen direkte Prisma-aanroepe
  v
Server actions / API routes
  |  sessie + CSRF/oorsprong + invoervalidering
  v
Member authorization policy
  |  vermoe + proef-toelatingslys + rekord/wyk-omvang
  v
Member services
  |  transaksies + optimistiese weergawe + oudit
  +---------------------> Task service
  |                         | onderwerp-toegang word weer getoets
  v                         v
Neon PostgreSQL <------- TaskSubject
```

- Hou nuwe domeinkode onder `lib/members/` met klein modules vir beleid, navrae, bevele, invoer, uitvoer en oudit. API-roetes vertaal HTTP na getipeerde diensaanroepe; hulle dra geen eie besigheidsreels nie.
- Geen kliëntkomponent ontvang Prisma-modelle of velde wat nie op daardie skerm nodig is nie. Dienste lewer eksplisiete aansigmodelle en roetes gebruik `private, no-store` vir sensitiewe reaksies.
- `proxy.ts` bly 'n growwe aanmeldhek. Elke diensfunksie doen steeds sy eie magtiging sodat direkte URL-, server action- en API-aanroepe dieselfde beleid volg.
- Alle skryfaksies loop in 'n databasistransaksie wat die domeinverandering, geskiedenis en oudit saam voltooi. 'n Mislukte oudit beteken die sensitiewe verandering word teruggerol.
- Gebruik 'n `version`-heelgetal op veranderbare kernrekords, volgens die bestaande taakpatroon. 'n Opdatering doen `where: { id, version }` en verhoog die weergawe; nul veranderde rye lewer 'n konflik, nie 'n stil laaste-skrywer-wen nie.

#### Magtigingsmodel

Moenie `UserRole` uitbrei om lidmaatbetekenis te dra nie. Voeg doelgerigte vermoens en omvang by:

- `MemberCapabilityGrant`: gebruiker, vermoe (`MEMBER_READ`, `MEMBER_WRITE`, `HOUSEHOLD_WRITE`, `WARD_WRITE`, `MEMBER_EXPORT`, `MEMBER_IMPORT_PREVIEW`, `MEMBER_AUDIT_READ`) en opsionele vervaldatum.
- `MemberWardScope`: gebruiker en wyk. 'n Leë omvang beteken nie outomaties “alle wyke” nie; globale toegang is 'n eksplisiete omvangwaarde of grant.
- `MemberPilotAccess`: eksplisiete toelatingslys vir die proef, afsonderlik van die vermoens. Die bedienerfunksievlag moet ook aan wees.
- Voeg 'n eksplisiete `disabledAt`-rekeningstaat by wat tydens aanmelding en elke lidmaatmagtiging nagegaan word. Die bestaande `emailVerified`-veld is nie 'n deaktiveringsmeganisme nie, aangesien die huidige aanmelding ongeverifieerde e-pos toelaat.
- Slegs 'n afsonderlike `MEMBER_ACCESS_ADMIN`-vermoe mag proefgrants en wyk-omvang bestuur. 'n Gewone `ADMIN` mag nie homself of iemand anders lidmaattoegang gee nie. Deaktivering trek proefaccess, grants, omvang en sessies atomies terug.
- Een `authorizeMemberAction(actor, action, resource)`-beleid gee 'n toegelate omvang of weier. Lysnavrae voeg die omvang by die databasisfilter; detail- en skryfaksies kontroleer die spesifieke rekord binne dieselfde diensaanroep.
- 'n Onbevoegde rekord-ID lewer dieselfde `404`-antwoord as 'n onbekende ID om 'n bestaan-orakel te voorkom. Oudit skryf wel intern die geweierde aksie sonder PII.
- 'n Taak met 'n lidmaatonderwerp erf die strengste gekoppelde rekordtoegang vir die hele taak: lys, ongeleestelling, detail, beskrywing, gesprek, werkvloei, toewysing, idempotente herhaling en aanhangsels. Daar is nie 'n gedeeltelik leesbare beskermde taak nie.
- Bestaande taakaanhangsels gebruik openbare URL's. Lidmaatgekoppelde take laat dus geen aanhangsels toe totdat private berging en 'n gemagtigde aflaairoete bestaan nie. Koppel/ontkoppel vereis lidmaatskryfregte, word geoudit en mag nie histories sensitiewe taakinhoud weer wyd sigbaar maak nie.

#### Datamodel en Invariante

`TaskSubject` word 'n werklike relasiemodel met `taskId` en presies een van `memberId`, `householdId` of `wardId`. 'n Databasiskontrolebeperking dwing “presies een nie-null” af; vreemde sleutels en saamgestelde unieke indekse voorkom wees- en duplikaatkoppelings. Dit is veiliger en meer navigeerbaar as 'n generiese `entityType` plus string-ID.

Kerninvariante:

- `Member` en `Household` het stabiele ID's, `version`, `archivedAt` en geen gewone hard-delete-roete nie.
- `HouseholdMember` laat hoogstens een huidige huishouding per lidmaat toe. Datumbereike mag nie oorvleuel nie en `endDate` kan nie voor `startDate` wees nie.
- `WardAssignment` ondersteun 'n huishouding se gewone wyk en 'n eksplisiete individuele uitsondering. Daar mag hoogstens een huidige toewysing per onderwerp wees; die UI wys duidelik wanneer 'n lidmaatuitsondering die huishouding se wyk oorheers.
- Tydperke is half-oop (`startDate` ingesluit, `endDate` uitgesluit). Effektiewe wyk is die huidige individuele uitsondering, anders die huishouding se huidige wyk; ongekoppelde en geargiveerde rekords verg 'n eksplisiete globale vermoe.
- 'n Skuif tussen wyke of huishoudings vereis skryfregte op bron, bestemming en elke geraakte gedeelde rekord. Magtiging, omvangherberekening en verandering gebeur in dieselfde transaksie met weergawes op die verhoudingrekords, nie net op `Member` nie.
- 'n Huishouding het hoogstens een huidige hooflid. Gemengde-wyk huishoudings is slegs moontlik deur eksplisiete individuele uitsonderings en wys geen ander huishoudingslede aan 'n gebruiker buite hul omvang nie.
- Gedeelde adresse is weergawes/tydperke, nie muterende teks op elke lidmaat nie. 'n Skuif sluit die vorige tydperk en skep 'n nuwe een.
- Kontakpunte bewaar die vertoonwaarde en 'n genormaliseerde soek-/duplikaatwaarde. Normalisering mag nooit die oorspronklike waarde vernietig nie.
- `MemberSourceRecord` is uniek per `(sourceSystem, sourceRecordId)` en dra bondel-ID, bronhash en laaste vergelykingsuitslag. Dieselfde bronlêer en ry kan veilig herhaal word.
- `MemberAuditEvent` is append-only en bevat entiteit, aksie, tyd, bron, veilige voor/na-delta, akteur-ID waar beskikbaar en 'n onveranderlike akteur-naam/rol-momentopname. Die akteurverhouding is nullable met `SetNull` of verwydering van gebruikers word beperk; dit gebruik nooit `Cascade` nie.
- Databasisbeperkings word in eksplisiete SQL-migrasies bygevoeg waar Prisma dit nie kan uitdruk nie. Dienste valideer dieselfde reels vir bruikbare Afrikaanse foutboodskappe, maar die databasis bly die finale veiligheidsnet.

#### Invoer- en Uitvoerlewensiklus

Fase 1 pas geen ingevoerde rye toe nie. Die voorskou is steeds produksiegehalte:

1. Aanvaar slegs CSV/XLSX binne 'n klein, gekonfigureerde limiet (aanvanklik 5 MB) en verifieer uitbreiding, MIME en lêerhandtekening waar moontlik.
2. Ontleed na 'n gekanoniseerde tussenformaat; bronkolomme word deur 'n eksplisiete profiel gekarteer, nooit deur posisie alleen nie.
3. Bereken 'n SHA-256-lêerhash en ryhashes, maar plaas geen rou PII in toepassinglogboeke nie.
4. Klassifiseer elke ry as geldig, onbekende waarde, onvolledig, presiese bestaande bron, waarskynlike duplikaat of konflik.
5. Stoor slegs die invoerbondel se metadata, veilige tellings en uitsonderingsverwysings wat vir die voorskou nodig is. Die bestaande openbare Blob-/R2-oplaairoetes mag nie hiervoor gebruik word nie. Rou lêers gaan na private, tydelike berging, is slegs vir die oplaaier en invoergemagtigdes leesbaar, verval binne 24 uur en word ook na sukses, fout en vasgeloopte verwerking opgeruim.
6. Toon rekonsiliasie: bronrye = geldig + uitgesluit + dubbelsinnig + ongeldig. Indien die vergelyking nie balanseer nie, misluk die hele voorskou.
7. 'n Latere toepasaksie gebruik dieselfde onveranderlike bondel/hash, vereis 'n vars magtiging en transaksie, en is idempotent. Dit word nie stilweg by Fase 1 gevoeg nie.

Benewens die 5 MB saamgeperste limiet, begrens die parser uitgepakte grepe, werkblaaie, rye, kolomme, selgrootte en uitvoeringstyd. Geënkripteerde werkboeke, makro's, eksterne verwysings en formules word geweier. Uitsonderingsverslae volg dieselfde formule-inspuitingbeskerming en toegang as gewone uitvoere. Multipart-oplaai kry 'n eksplisiete oorsprong/CSRF-kontrole; dit erf nie blindelings 'n JSON-roete se beskerming nie.

CSV-uitvoer word vanaf 'n bediener-gevalideerde filter en eksplisiete veldprofiel opgebou. Die voorskou kry 'n kortlewende, ondeursigtige bedienertoken gebind aan gebruiker, sessie, velde, filter en konsekwente momentopname. Aflaai kontroleer die proefvlag, vars herverifikasie, huidige grants en omvang weer; 'n gesteelde of ná herroeping gebruikte token misluk. Die watermerk dek lidmaat-, huishouding-, kontak- en wykveranderings, nie net rekordtelling nie. Die uitvoeroudit word gecommit voordat grepe vrygestel word. Waardes wat met `=`, `+`, `-`, `@`, tab of carriage return begin, word teen sigbladformule-inspuiting beveilig. UTF-8/BOM en lyn-eindes word met die werklike kantoorprogrammatuur bevestig.

#### Foutkontrak

| Domeinfout | HTTP/aksie | Gebruikersboodskap | Bedienerhantering |
|---|---|---|---|
| Nie aangemeld | `401` | `Meld asseblief weer aan.` | Geen data; korrelasie-ID |
| Geen toegang / buite omvang | `404` vir rekord, `403` vir funksie | `Hierdie rekord is nie beskikbaar nie.` | Oudit geweierde aksie sonder PII |
| Ongeldige invoer | `400` | Veldspesifieke Afrikaanse fout | Gestruktureerde veldfoute; geen stack trace |
| Weergawekonflik | `409` | `Iemand het hierdie rekord intussen verander.` | Gee veilige nuwe weergawe; behou gebruiker se konsep |
| Duplikaat-/karteringskonflik | `409` of voorskou-uitsondering | Verduidelik presies wat bevestig moet word | Geen outomatiese samesmelting |
| Lêerformaat/-limiet | `400`/`413` | Ondersteunde tipe en maksimum grootte | Verwyder tydelike lêer |
| Verouderde uitvoervoorskou | `409` | `Die data het verander; besigtig die uitvoer weer.` | Geen lêer word gelewer nie |
| Databasis/diens onbeskikbaar | `503` | `Die register is tydelik nie beskikbaar nie.` | Log korrelasie-ID, geen PII; geen gedeeltelike skryf |

#### Prestasie en Skaal

Ses honderd lidmate is klein, maar die ontwerp moet steeds veilige navrae afdwing:

- Bedienerbladsyindeling en 'n maksimum bladsygrootte; moenie die hele register na die blaaier stuur nie.
- Indekse op genormaliseerde van/voornaam, status, huidige wyk, huishouding en argiefstatus. Begin met eenvoudige geprefikseerde soek; voeg eers trigram-/voltekssoek by indien gemete gebruik dit vereis.
- Selekteer slegs lyskolomme; laai detail en geskiedenis op aanvraag. Gebruik begrensde `include`/`select`-navrae om N+1-gedrag te voorkom.
- Soek word aan kliëntkant kort vertraag en ou resultate bly tydens herlaai sigbaar. Geen optimistiese verandering word as finaal gewys voordat die geouditeerde transaksie slaag nie.
- CSV van die proefskaal kan begrens in geheue geskep word; stel 'n harde rekord-/grootteperk. Groter toekomstige uitvoere skuif na 'n geouditeerde agtergrondtaak eerder as om 'n funksie tyd-uit te laat loop.

#### Toetsstrategie

Die repo gebruik tans gefokusde TSX-verifikasieskripte eerder as 'n algemene Jest/Vitest-suite. Fase 1 voeg klein, herhaalbare diens- en databasisverifikasies by volgens daardie patroon en gebruik produksie-blaaier-QA ná Vercel-ontplooiing.

Die volledige Autoplan-toetsartefak is gestoor by `~/.gstack/projects/cyrus-za-annlin-website/pieter-main-test-plan-20260917-114500.md`.

| Gebied | Verpligte gevalle |
|---|---|
| Magtiging | Elke vermoe × geen/globale/wykomvang; lys, direkte ID, wysig, geskiedenis, uitvoer, invoer en elke taakpad; bestaande `ADMIN` sonder grant, self-granting, vars login ná deaktivering en bestaande sessie ná herroeping word geweier |
| Invariante | Tweede huidige huishouding/hooflid, half-oop oorvleuelende tydperke, kruis-wykskuif, gemengde huishouding, ongeldige datums, wees-onderwerp en meer as een onderwerp-FK word deur diens en DB geweier |
| Transaksies | Geforseerde ouditfout rol die domeinskryf terug; twee gelyktydige wysigings lewer een sukses en een `409` |
| Geskiedenis | Argiveer/heraktiveer behou alle vorige toewysings; gebruiker-deaktivering/verwydering vernietig geen oudit nie |
| Taakkoppeling | Beide kante navigeer; alle taakpaaie pas onderwerpbeleid toe; voorheen gemagtigde gebruikers, ontkoppeling, publieke aanhangsels en kennisgewings lek geen PII nie |
| Invoer | Leeg, verkeerde formaat, te groot, zip-bom, te veel rye/selle, formules/eksterne verwysings, vreemde enkodering, dubbels, onbekende enums, kruis-gebruiker bondeltoegang, opruimfout, herhaalde bondel en gebalanseerde tellings |
| Uitvoer | Filter/telling/kolomme stem; gesteelde/verouderde token en herroepe toegang weier; gelyktydige verandering met dieselfde telling weier; CSV en uitsonderingsverslag neutraliseer formule-inspuiting |
| UI/a11y | Sleutelbord, fokus-terugkeer, 200%-zoom, selfoon, lang name, ontbrekende data, leë/fout/verouderde state en Afrikaanse etikette |
| HTTP/DB-grense | Geïsoleerde sintetiese databasis toets sessies, CSRF, aflaaimagtiging en roetekontrakte; direkte SQL-toetse bewys CHECK-/unieke beperkings en databasisiweiering van oudit-update/delete |
| Herstel | Rugsteun na aparte herstelomgewing; rekord-, verhouding- en oudit-tellings plus steekproefhashes stem ooreen; proef bly af en herroepe grants word nie heraktiveer nie |

Toetsvloei-diagram:

```text
Aanmelding
  ├── rekening aktief? ── nee ──▶ 401 / geen sessie
  └── proefvlag + grant + omvang
        ├── lys/soek ──▶ filter by DB ──▶ veilige lys-aansig
        ├── detail ──▶ direkte-ID omvang ──▶ detail/404
        ├── wysig ──▶ validate ──▶ version check ──▶ data + geskiedenis + oudit
        ├── taak ──▶ onderwerpbeleid op ELKE taakpad ──▶ taak/404
        ├── uitvoer ──▶ preview token ──▶ herauth/recheck ──▶ audit ──▶ CSV
        └── invoer ──▶ private upload ──▶ limiete/kartering ──▶ rekonsiliasie
                                                     └── 0 DB-wysigings in Fase 1
```

Elke tak hierbo het 'n diens-/databasistoets; sessie, CSRF, token- en aflaaigrenste kry HTTP-toetse; die responsiewe UI en toeganklikheid kry produksie-blaaier-QA. Daar is geen LLM-/promptlogika en dus geen model-evalueringsuite vir hierdie module nie.

#### Ontplooiing en Terugrol

1. Land slegs additiewe skema en verborge kode; die bedienerfunksievlag is af en geen gebruiker het grants nie.
2. Voer migrasieverifikasie en sintetiese saai uit. Migreer nooit werklike PII na voorskou-ontplooiings nie.
3. Aktiveer die vlag en grants net vir Pieter, voltooi diens- en produksie-smoke-toetse, en aktiveer daarna Clarissa.
4. Laat Clarissa die sintetiese kernvloei voltooi en teken tyd, foute en terugvoer aan.
5. Voor enige werklike steekproef: formele magtiging, veldinventaris, retensie, rugsteun en onafhanklike hersteltoets moet groen wees.
6. Terugrol beteken: skakel die bedienervlag af en trek grants terug. Hou additiewe tabelle en ouditdata; moenie 'n destruktiewe afmigrasie tydens 'n insident uitvoer nie.
7. Sodra enige lidmaatgekoppelde taak of werklike data bestaan, is die eerste vrystelling met volledige taakmagtiging die minimum veilige terugrolweergawe. 'n Ouer ontplooiing mag nie heraktiveer word nie omdat die ou taakdienste alle admins breë toegang gee.
8. Gebruik een gedokumenteerde produksiemigrasiepad met 'n slot, herhaalbare stappe, eksplisiete gedeeltelike-fout herstel en 'n inspeksieskrip vir SQL-beperkings. `prisma db push` is nie 'n produksiemigrasiepad vir hierdie module nie.
9. Stel hersteldoelwitte vir dataverlies en hersteltyd vas. Hersteltoetse gebruik 'n aparte omgewing, bewaar onverwante webwerfskrywes en begin altyd met die proefvlag af.

#### Ingenieursmislukkingsregister

| Mislukking | Vroeë sein | Mitigasie | Terugrol/reaksie |
|---|---|---|---|
| Toegang lek oor wyke | Direkte-ID toets slaag buite omvang | Sentrale beleid en DB-gefilterde navrae | Vlag af, grants terugtrek, oudit ondersoek |
| Oudit en data verskil | Entiteit verander sonder gebeurtenis | Een transaksie; ouditfout is fataal | Skryfaksies af, rekonsilieer vanaf geskiedenis |
| Invoer skep duplikate | Dieselfde bondel verhoog tellings | Bron-/ryhashes en unieke beperkings | Geen toepas in Fase 1; rol bondeltransaksie terug |
| Taak lek sensitiewe data | Naam verskyn vir onbevoegde gebruiker | Geen PII in taakopskrif; onderwerpbeleid by lees | Verberg koppeling, hersien kennisgewings/oudit |
| Uitvoer word verkeerd gedeel | Groot/onverwagte telling | Voorskou, veldprofiel, herverifikasie en oudit | Trek toegang; volg goedgekeurde insidentproses |
| Prisma-migrasie kan nie beperking dra nie | Skema genereer sonder CHECK/partial unique | Handgeskrewe SQL plus inspeksieskrip | Stop ontplooiing; geen app-aktivering |

**Ingenieurstelling na verskerping:** 9/10. Die oorblywende onsekerheid is inhoudelik: werklike Winkerk-/Doulos-kolomme, goedgekeurde velde en retensie kan eers met 'n geminimiseerde bronmonster bevestig word.

#### Ingenieursstemkontrole

| Dimensie | Onafhanklike Codex | Claude-subagent | Konsensus/aksie |
|---|---|---|---|
| Argitektuur | Geen kritieke gebrek; sentrale beleid en transaksies is reg | Nie beskikbaar | Enkelingstem, plan behou |
| Toetsdekking | HTTP-/DB-grense moes sterker wees | Nie beskikbaar | By toetsmatriks gevoeg |
| Prestasie | Begrensde navrae is voldoende vir huidige skaal | Nie beskikbaar | Enkelingstem, harde limiete behou |
| Sekuriteit | Deaktivering, hele-taak beskerming, uitvoertokens en private invoer was gapings | Nie beskikbaar | Alle hoë bevindings ingewerk |
| Foutpaaie | Gelyktydige verhoudingwysigings en opruimfoute moes bykom | Nie beskikbaar | Invariante en toetse uitgebrei |
| Ontplooiing | Ou terugrolle en gemengde migrasiepad was riskant | Nie beskikbaar | Minimum veilige release en een migrasiepad vereis |

**Kritieke-gapingsstatus:** geen kritieke gebrek bly in die plan bekend nie. Al die hoë bevindings is nou harde hekke voor werklike data, nie opsionele opvolgwerk nie.

| # | Fase | Besluit | Klassifikasie | Beginsel | Rasionaal | Verwerp |
|---|---|---|---|---|---|---|
| 9 | Ingenieurs | Gebruik sentrale vermoë-plus-omvang beleid, nie nuwe globale rolle nie | Meganies | Veilige verstek | Voorkom dat elke bestaande admin alle lidmaatdata erf. | `ADMIN` impliseer alles |
| 10 | Ingenieurs | Modelleer taakonderwerpe met eksplisiete vreemde sleutels en presies-een-beperking | Meganies | Maak ongeldige state onmoontlik | Behou referensiële integriteit en veilige navigasie. | Polimorfiese string-ID |
| 11 | Ingenieurs | Maak domeinskryf, geskiedenis en oudit een transaksie | Meganies | Betroubaarheid bo gerief | 'n Verandering sonder geskiedenis is onaanvaarbaar. | Beste-poging oudit |
| 12 | Ingenieurs | Gebruik optimistiese weergawes vir sensitiewe redigering | Meganies | Bewaar gebruikerwerk | Vermy stil laaste-skrywer-wen. | Onvoorwaardelike update |
| 13 | Ingenieurs | Hou Fase 1-invoer streng by voorskou | Smaak | Risiko-geordende aflewering | Bewys die gevaarlike parser/kartering sonder werklike mutasie. | Volle invoer nou |
| 14 | Ingenieurs | Gebruik vlag/grant-terugrol en behou additiewe data | Meganies | Omkeerbaarheid | Vermy destruktiewe databasisaksies tydens insidente. | Afmigrasie as terugrol |

### Fase 4: Ontwikkelaar- en Operateurservaring

**Produksoort:** interne toepassing met sensitiewe data en 'n klein stel administratiewe bedryfsnutsmiddels. Daar is geen openbare API/SDK om te ontwerp nie. Die belangrike “ontwikkelaar” is Pieter of 'n toekomstige tegniese opvolger wat die proef veilig moet migreer, diagnoseer, herstel en aan iemand anders oorhandig.

**Modus:** DX-verskerping. Die doel is nie 'n nuwe raamwerk nie; dit is om gevaarlike eenmalige opdragte deur klein, voorspelbare en gedokumenteerde werkvloeie te vervang.

#### Persona en Empatie

| Eienskap | Beskrywing |
|---|---|
| Primere operateur | Pieter, vertroud met die repo maar dikwels op 'n geheuebeperkte devbox |
| Sekondere operateur | 'n Tegniese opvolger wat nie die oorspronklike migrasiegeskiedenis ken nie |
| Hoofdoel | Bewys skema/invoer/herstel veilig sonder om PII te lek of die openbare webwerf te ontwrig |
| Grootste vrees | 'n “Suksesvolle” script wat gedeeltelike data, verkeerde grants of onherstelbare duplikate agterlaat |
| Omgewingsgrens | Geen plaaslike Next-build/dev/tsc op hierdie gasheer nie; Vercel bou en produksie-QA volg ná ontplooiing |

> Ek wil een eksplisiete droëloopopdrag uitvoer en binne minute 'n gebalanseerde, nie-sensitiewe opsomming kry. As iets verkeerd is, moet die opdrag nie raai of gedeeltelik voortgaan nie. Ek moet kan sien wat om reg te stel, dieselfde invoer veilig herhaal en die module met een vlag afskakel sonder om die res van die webwerf terug te rol.

#### Maatstaf en Magiese Oomblik

Die toepaslike maatstaf is gevestigde migrasienutsmiddels se gedrag: droëloop eerste, deterministiese invoer, duidelike nie-nul uitgangskodes, masjienleesbare opsommings en herhaalbaarheid. Nie die aantal CLI-vlae of 'n interaktiewe towenaar nie.

Die magiese oomblik is wanneer die operateur een geminimiseerde lêer aan die voorskou gee en presies hierdie bewys ontvang sonder PII:

```text
Bondel: wm-2026-09-sample
Bronrye: 40
Geldig: 34 | Presiese bronrekords: 2 | Moontlike duplikate: 2 | Ongeldig: 2
Rekonsiliasie: 40 = 34 + 2 + 2 + 2
Databasiswysigings: 0
Uitsonderingsverslag: geskep (gemagtigde aflaai)
Uitkoms: VOORSKOU GESLAAG
```

#### Bedieningskontrakte

- Alle nuwe scripts is nie-interaktief, dokumenteer vereiste omgewingsleutels by naam sonder waardes en weier vroeg indien 'n sleutel ontbreek.
- `member:import:preview` is altyd leesalleen. 'n Toekomstige toepasopdrag is 'n afsonderlike script met 'n eksplisiete bondel-ID, verwagte hash en bevestigingsvlag; daar is geen `--dry-run=false`-kortpad nie.
- Elke script skryf 'n kort mensleesbare opsomming en kan `--json` lewer. JSON bevat tellings, IDs/hashes wat nie PII is nie, tydsduur en uitkoms; geen name, adresse, selfone, e-posse of rou rye nie.
- Waarskuwings en foute gaan na stderr; suksesdata gaan na stdout. Enige ryverlies, ongebalanseerde telling, ontbrekende beperking of gedeeltelike aksie lewer 'n nie-nul uitgangskode.
- `member:schema:verify` inspekteer die verwagte tabelle, vreemde sleutels, CHECK-/unieke beperkings en indekse ná migrasie.
- `member:seed:synthetic` is idempotent, duidelik gemerk en kan slegs sy eie bekende sintetiese datastel skoonmaak.
- `member:restore:verify` werk slegs teen 'n eksplisiete nie-produksie herstel-URL, kontroleer die proefvlag is af en vergelyk veilige tellings/hashes. Dit mag nooit die aktiewe produksiedatabasis as teiken aanvaar nie.
- Scripts aanvaar lêerpaaie; hulle druk nie lêerinhoud nie. Tydelike lêers kry beperkende regte en word met `finally`-opruiming plus 'n periodieke opruimtaak verwyder.

#### Operateursreis

| Stap | Opdrag/artefak | Suksesbewys | Mislukkingshulp |
|---|---|---|---|
| 1. Berei voor | `docs/member-register-runbook.md` | Besluite, eienaar, omgewing en geen-PII grens is duidelik | Voorvereiste-kontrolelys |
| 2. Migreer | een weergawebeheerde migrasie-opdrag | Migrasie-ID en slot voltooi | Herhaal-/herstelpad per stap |
| 3. Verifieer skema | `member:schema:verify --json` | Alle beperkings groen | Presiese ontbrekende naam, geen data dump |
| 4. Saai | `member:seed:synthetic` | Bekende sintetiese tellings | Veilige eie-datastel skoonmaak |
| 5. Toets invoer | `member:import:preview --input ... --profile ...` | Gebalanseerde tellings, nul wysigings | Gemagtigde uitsonderingsverslag |
| 6. Toets herstel | herstelhandleiding + `member:restore:verify` | RPO/RTO en veilige hashes stem | Stop; moenie proef aktiveer nie |
| 7. Ontplooi | Vercel + bedienervlag/grants | Presiese commit `READY`, vlag eers af | Herroep grants/vlag; minimum veilige release |
| 8. QA | produksie-blaaier met sintetiese data | Kernvloei en a11y slaag | Korrelasie-ID en diagnostiese kontrolelys |
| 9. Herroep/oorhandig | vlag, grants en runbook | Geen toegang; oudit en data bly veilig | Noodkontak en minimum veilige release |

#### Dokumentasie en Oorhandiging

Die runbook bevat:

- argitektuur- en datavloeidiagram;
- wie toegang mag gee en hoe toegang onmiddellik herroep word;
- die enigste ondersteunde migrasie-, invoer-, uitvoer- en herstelopdragte;
- veilige voorbeeld-uitvoer met sintetiese data;
- foutkodes, betekenis en volgende stap;
- rugsteun-/hersteldoelwitte en laaste suksesvolle hersteltoets;
- dataretensie- en opruimverantwoordelikheid;
- minimum veilige ontplooiingsweergawe en verbode ou terugrolle;
- noodpad indien Pieter nie beskikbaar is nie.

#### DX-telling

| Dimensie | Voor | Ná plan | Bewys |
|---|---:|---:|---|
| Aan die gang kom | 4 | 9 | Een runbook en voorvereistekontrole |
| API/CLI-ergonomie | 3 | 9 | Raai-bare name, veilige verstekke en afsonderlike toepasaksie |
| Foute en diagnose | 4 | 9 | Domeinfoute, korrelasie-ID, geen PII |
| Dokumentasie en leer | 3 | 9 | Een runbook, sintetiese voorbeelde en foutkodes |
| Opgradering/migrasie | 4 | 9 | Slot, hashes, idempotensie, skemaverifikasie |
| Ontwikkelomgewing/gereedskap | 4 | 8 | Ligte gefokusde scripts; Vercel besit swaar bouwerk |
| Ekosisteem/oorhandiging | 3 | 8 | Geen openbare SDK nodig; opvolger- en noodpad is gedokumenteer |
| Meetbaarheid/terugvoer | 4 | 8 | JSON-opsommings, nie-PII proefmaatstawwe en Clarissa-waarneming |

**Totale DX-telling:** 3.6/10 na 8.6/10. Die telling word eers werklik bewys wanneer 'n tweede persoon die runbook en hersteltoets sonder Pieter voltooi.

**Tyd tot eerste veilige voorskou:** tans ongedefinieerd en handmatig; teiken is minder as 15 minute vanaf 'n voorbereide checkout en geminimiseerde sintetiese lêer. Minder as vyf minute is nie die regte maatstaf vir 'n sensitiewe migrasie met omgewings- en databasisvoorvereistes nie.

#### DX-stemkontrole en Kontrolelys

'n Tweede ontwikkelaarstem is nie afsonderlik uitgevoer nadat die onafhanklike ingenieursbeoordeling reeds die bedryfsrisiko's uitgewys het nie; Claude is nie beskikbaar nie. Geen konsensus word gefabriseer nie. Die DX-besluite volg direk uit die bevestigde migrasie-, privaatheid- en herstelbevindinge.

- [ ] Een raai-bare opdrag per operasionele taak; geen verborge muterende vlag nie.
- [ ] `--help`, veilige voorbeeld en vereiste sleutelname vir elke script.
- [ ] Mensleesbare en `--json`-uitvoer sonder PII.
- [ ] Nie-nul uitgang vir gedeeltelike, ongebalanseerde of onveilige uitkomste.
- [ ] Idempotente sintetiese saad en bekende skoonmaakgrens.
- [ ] Produksiemigrasie met slot, inspeksie en herhaalpad.
- [ ] Private tydelike lêers en bewese opruiming.
- [ ] Hersteltoets deur 'n tweede persoon en datum in die runbook.

| # | Fase | Besluit | Klassifikasie | Beginsel | Rasionaal | Verwerp |
|---|---|---|---|---|---|---|
| 15 | DX | Maak voorskou en toepassing afsonderlike opdragte | Meganies | Veilige verstek | Voorkom 'n gevaarlike negatiewe vlag of tikfout. | `--dry-run=false` |
| 16 | DX | Standaardiseer veilige mens- en JSON-opsommings | Meganies | Diagnose sonder datalek | Ondersteun operateur en outomatisering sonder PII. | Rou ry-dumps |
| 17 | DX | Vereis skema-inspeksie ná migrasie | Meganies | Vertrou maar verifieer | Prisma alleen bewys nie handgeskrewe DB-beperkings nie. | Aanvaar migrasie-uitgang |
| 18 | DX | Maak onafhanklike herstel die finale bedryfshek | Smaak | Verminder sleutelpersoonrisiko | Dokumentasie is eers bewys wanneer iemand anders dit kan uitvoer. | Pieter-only runbook |

## Implementeringsplan

### Werkstroom 0: Besluite en Veilige Fondasie

- Kry formele proefmagtiger, retensie-eienaar en toekomstige hersteltoetser; dokumenteer die besluit sonder lidmaatdata in Git.
- Kry 'n geminimiseerde Winkerk-veldlys en huidige wykslys-uitleg; merk elke veld as nou/later/nooit/sensitief en bepaal die eerste CSV-profiel.
- Voeg die bedienerfunksievlag, `disabledAt`, proef-toelatingslys, vermoens en wyk-omvang by met deny-by-default beleid.
- Sluit self-granting uit en voeg atoom-deaktivering van sessies/grants/omvang by.

### Werkstroom 1: Skema en Dienste

- Voeg additiewe Prisma-modelle en SQL-beperkings vir lidmate, huishoudings, adresse, kontakte, wyke, toewysings, geskiedenis, bronrekords, grants en lidmaatoudit by.
- Voeg `TaskSubject` met presies-een-vreemde-sleutel beperking by en beskerm elke bestaande taaklees-/skryfpad wanneer 'n onderwerp bestaan.
- Skep `lib/members/authorization`, navraag-, bevel-, oudit- en aansigmodelmodules; geen roete mag Prisma direk vir lidmaatdata gebruik nie.
- Voeg optimistiese weergawes en transaksionele geskiedenis/oudit by; blokkeer gewone hard delete.
- Voeg skema-inspeksie, sintetiese saad en diens-/DB-toetsskripte by.

### Werkstroom 2: Register en Kernvloei

- Voeg die afgeskermde `Lidmate [PROEFLOPIE]`-navigasie en register met bedienerbladsyindeling, soek en kernfilters by.
- Bou die responsiewe detailpaneel, huishouding-/wykkonteks, geskiedenis en eksplisiete transaksionele redigeervorm.
- Voeg taaklys en taakskep vanaf lidmaat/huishouding/wyk by; hou aanhangsels vir gekoppelde take afgeskakel totdat private aflewering bestaan.
- Voltooi leë, laai-, fout-, konflik-, verouderde en ontoeganklike toestande plus sleutelbord/fokusgedrag.

### Werkstroom 3: Wykslys en Invoer-voorskou

- Bou die wykslysvoorskou met toegelate veldprofiel, telling, vertroulikheidsmerk, herverifikasie en gebruiker-/sessiegebonde token.
- Genereer die CSV vanaf 'n konsekwente momentopname, neutraliseer formule-inspuiting en commit oudit voor aflaai.
- Bou private tydelike invoer, begrensde CSV/XLSX-ontleding, eksplisiete profielkartering, duplikaatvoorstelle en gebalanseerde uitsonderings.
- Lewer slegs voorskou in Fase 1; geen toepasroete of verborge toepasvlag nie.

### Werkstroom 4: Verifikasie, Ontplooiing en Clarissa-toets

- Voer gefokusde diens-, databasis- en HTTP-grenstoetse teen sintetiese data uit; geen swaar plaaslike Next-/TypeScript-proses op die devbox nie.
- Ontplooi via Vercel met vlag af, verifieer die presiese commit en aktiveer eers Pieter se proefgrant.
- Gebruik gstack-blaaier-QA in produksie vir desktop/selfoon, toeganklikheid en die volledige sintetiese werkvloei; aktiveer daarna Clarissa.
- Laat Clarissa die vyfstap kernvloei sonder tegniese hulp voltooi en teken taaktyd, verwarring, foute en datakwaliteit aan sonder PII.
- Voltooi 'n onafhanklike hersteltoets voordat enige werklike steekproef oorweeg word.

## Finale Aanvaardingshekke

| Hek | Status ná Autoplan | Nodig voor implementering/werklike data |
|---|---|---|
| Produkgrens | Besluit | Veilige vertikale proef; Winkerk bly amptelik |
| Ontwerppatroon | Besluit | Responsiewe detailpaneel en eksplisiete stoor |
| Magtiging | Gespesifiseer | Outomatiese matrikstoetse moet groen wees |
| Datainvariante | Gespesifiseer | SQL-inspeksie en direkte DB-toetse moet groen wees |
| Taakprivaatheid | Gespesifiseer | Alle paaie beskerm; geen openbare aanhangsels |
| Invoer/uitvoer | Gespesifiseer | Slegs private voorskou; uitvoertoken en oudit bewys |
| Rugsteun/herstel | Nog bewys nodig | Onafhanklike hersteltoets voor werklike PII |
| Inhoud/retensie | Oop organisatoriese besluit | Formele eienaar, velde en tydperke voor werklike PII |

## Kruisfase-temas

- **Vertroue deur eksplisiete grense:** strategie, ontwerp en ingenieurswerk vereis almal dat die proefstatus, bron van waarheid, stooraksie en magtiging sigbaar en afdwingbaar moet wees.
- **Omkeerbaarheid sonder dataverlies:** produkbegrensing, additiewe migrasies, vlag/grant-terugrol en hersteltoetse wys dieselfde rigting.
- **Een werkvloei, nie nog 'n databasis nie:** taakskakeling, registerkonteks en uitvoer moet Clarissa se opvolgwerk verminder; anders het die proef nie produkwaarde nie.
- **Geen PII as diagnostiese gerief nie:** invoer, logs, JSON-uitvoer, taakinhoud en foutboodskappe volg dieselfde privaatheidsreel.

## Fout- en Reddingsregister

| Situasie | Outomatiese beskerming | Operateur se reddingspad |
|---|---|---|
| Verkeerde gebruiker kry grant | Deny-by-default, aparte grant-admin en oudit | Trek grant/sessies terug, vlag af, ondersoek oudit |
| Halfvoltooide skryf | Data + geskiedenis + oudit in een transaksie | Herprobeer met dieselfde operasiesleutel; geen handmatige rypleister |
| Verkeerde bronkartering | Fase 1 is slegs voorskou en tellings moet balanseer | Wysig profiel, skep nuwe bondel en herhaal |
| Verouderde vorm/uitvoer | Weergawe-/momentopnamekonflik | Herlaai, vergelyk en bevestig weer |
| Ontplooiingsregressie | Vlag aanvanklik af en minimum veilige release | Vlag af/grants terug; ontplooi nie ouer onveilige release nie |
| Pieter onbeskikbaar | Runbook en onafhanklike herstelbewys | Benoemde opvolger volg nood- en herstelpad |

## Uitgestelde Werk

- Volle Winkerk-/Doulos-toepasinvoer volg eers nadat die voorskou met 'n geminimiseerde bronmonster bewys is.
- Gemeente-, susters- en pasgemaakte verslae plus PDF volg ná die wykslys-CSV.
- Ouderling-/wyksusteruitrol volg eers ná veld- en wykbeleid.
- Private taakaanhangsels volg as 'n afsonderlike berging-/aflaaifunksie; geen openbare plekhouer word aanvaar nie.
- Lidmaat-selfdiens, selfoon-/WhatsApp-aanmelding en gekonsolideerde kommunikasie bly aparte toekomstige produkfases.
- Finansies, bydraes, katkisasie en pastorale notas bly buite die module.

## Autoplan-uitkoms

**Implementeringsgereed:** Ja, vir Werkstroom 0 en die sintetiese Fase 1-proef.  
**Werklike lidmaatdata gereed:** Nee. Formele magtiging, veldinventaris, retensie, veilige taakaanhangsels, magtigingstoetse en onafhanklike herstel bly harde hekke.  
**Aanbevole volgende stap:** begin met Werkstroom 0 en die deny-by-default fondasie; moenie UI-skerms eerste bou en sekuriteit later probeer aanlas nie.
