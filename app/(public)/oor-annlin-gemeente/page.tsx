import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Breadcrumb } from '@/components/public/Navigation'
import Link from 'next/link'
import { Calendar, Users, Heart, BookOpen, ArrowRight } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Oor Annlin Gemeente | Gereformeerde Kerk Pretoria-Annlin',
  description: 'Leer meer oor die geskiedenis, visie en missie van Gereformeerde Kerk Pretoria-Annlin. Gestig in 1965 en toegewy aan die verkondiging van God se Woord.',
  keywords: ['geskiedenis', 'visie', 'missie', 'Gereformeerde Kerk', 'Pretoria-Annlin', 'gemeente', 'geloof'],
}

export default function AboutPage() {
  return (
    <div>
      <Breadcrumb items={[{ name: 'Oor Annlin-Gemeente' }]} />
      
      {/* Hero Section */}
      <section 
        className="relative text-white py-20 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(146, 64, 14, 0.85), rgba(120, 53, 15, 0.85)), url('/church-building-main.jpg')`
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Oor Annlin Gemeente
            </h1>
            <p className="text-xl text-amber-100 mb-4 max-w-3xl mx-auto">
              Gereformeerde Kerk Pretoria-Annlin
            </p>
            <p className="text-lg text-amber-200 max-w-4xl mx-auto">
              Geroep tot 'n lewende geloof in God-Drie-Enig waar almal hul gawes tot Sy eer gebruik
            </p>
          </div>
        </div>
      </section>

      {/* Mission and Vision */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-amber-900 mb-4">Ons Roeping</h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
              Ons wil die mense in ons omgewing en verder, aan Jesus en aan mekaar verbind om 
              God se missie op aarde in opdrag van Jesus voort te sit.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <Heart className="h-8 w-8 text-amber-700" />
                </div>
                <CardTitle className="text-amber-900">Ons Visie</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  'n Eensgesinde gemeente wat mense ontwikkel en toerus tot verantwoordelike, 
                  produktiewe Christene vir hul bedieninge in die kerk en die wêreld tot die eer van God.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-amber-700" />
                </div>
                <CardTitle className="text-amber-900">Ons Geloof</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  As kerk van Christus eer ons ons God en bedien ons mekaar met sy Woord en 
                  reik ook uit na buite. Ons doen dit omdat ons gedring word deur die liefde van God.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-amber-700" />
                </div>
                <CardTitle className="text-amber-900">Ons Gemeenskap</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Benewens die kerklike ampte, speel diensgroepe 'n belangrike rol om ons 
                  roeping as bruidsgemeente van Christus uit te leef.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="py-16 bg-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-amber-900 mb-6">Ons Geskiedenis</h2>
              
              <div className="space-y-6">
                <div className="border-l-4 border-amber-600 pl-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2">1965 - Stigting</h3>
                  <p className="text-muted-foreground">
                    Die Gereformeerde Kerk Pretoria-Annlin is op 16 Oktober 1965 gestig as 'n 
                    afstigting van die Gereformeerde Kerk Eloffsdal-Wonderboom-Suid.
                  </p>
                </div>
                
                <div className="border-l-4 border-amber-600 pl-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2">1974 - Kerkgebou</h3>
                  <p className="text-muted-foreground">
                    Die kerkgebou is op 20 April 1974 amptelik in gebruik geneem. Die teksvers op die 
                    gedenkplaat is 1 Korintiërs 3:9: "Want ons is medewerkers van God; die akker van God, 
                    die gebou van God is julle."
                  </p>
                </div>
                
                <div className="border-l-4 border-amber-600 pl-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2">Vandag</h3>
                  <p className="text-muted-foreground">
                    Onder leiding van ds. Pieter Kurpershoek (vanaf Oktober 2023) bedien ons 'n 
                    lewende gemeente van 631 belydende lidmate en 132 dooplidmate.
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <Button asChild>
                  <Link href="/jaarprogram">
                    <Calendar className="mr-2 h-4 w-4" />
                    Bekyk Ons Eredienste
                  </Link>
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              <div 
                className="h-64 bg-cover bg-center rounded-lg shadow-lg"
                style={{
                  backgroundImage: `url('/church-building-1974.jpg')`
                }}
              >
                <div className="h-full bg-gradient-to-t from-black/50 to-transparent rounded-lg flex items-end p-6">
                  <div className="text-white">
                    <h4 className="font-bold text-lg">Kerkgebou 1974</h4>
                    <p className="text-sm text-gray-200">Kort nadat dit in gebruik geneem is</p>
                  </div>
                </div>
              </div>

              <div 
                className="h-64 bg-cover bg-center rounded-lg shadow-lg"
                style={{
                  backgroundImage: `url('/church-building-main.jpg')`
                }}
              >
                <div className="h-full bg-gradient-to-t from-black/50 to-transparent rounded-lg flex items-end p-6">
                  <div className="text-white">
                    <h4 className="font-bold text-lg">Kerkgebou Vandag</h4>
                    <p className="text-sm text-gray-200">Die vergrote kerkgebou, 2019</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership and Contact */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Leadership */}
            <div>
              <h2 className="text-3xl font-bold text-amber-900 mb-8">Leierskap</h2>
              
              <div className="space-y-6">
                <div className="bg-amber-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-amber-900 mb-2">Ds. Pieter Kurpershoek</h3>
                  <p className="text-amber-700 font-medium mb-3">Predikant (vanaf Oktober 2023)</p>
                  <p className="text-muted-foreground">
                    Ds. Kurpershoek lei ons gemeente as enkelleraar en bring 'n hart vir 
                    evangelisasie en gemeenskapsbou na sy bediening.
                  </p>
                </div>

                <div className="bg-amber-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-amber-900 mb-2">Kerkraad</h3>
                  <p className="text-muted-foreground">
                    Ons kerkraad bestaan uit toegewyde ouderlinge en diakens wat die gemeente 
                    help lei en bedien volgens Bybelse beginsels.
                  </p>
                </div>

                <div className="bg-amber-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-amber-900 mb-2">Grace Reformed Church</h3>
                  <p className="text-muted-foreground">
                    In 2019 het 'n Engelse gemeente, Grace Reformed Church, van ons afgeskei. 
                    Ons deel steeds die kerkgebou en fasiliteite in broederskap.
                  </p>
                </div>
              </div>
            </div>

            {/* Our Beliefs and Values */}
            <div>
              <h2 className="text-3xl font-bold text-amber-900 mb-8">Ons Waardes</h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Skrifgetrouheid</h4>
                    <p className="text-muted-foreground">Ons glo in die onfeilbaarheid en gesag van die Bybel as God se Woord.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Gemeenskap</h4>
                    <p className="text-muted-foreground">Ons bou betekenisvolle verhoudings en ondersteun mekaar in geloof.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Evangelisasie</h4>
                    <p className="text-muted-foreground">Ons is toegewy aan die verspreiding van die Evangelie plaaslik en internasionaal.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-sm font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Diensbaarheid</h4>
                    <p className="text-muted-foreground">Ons moedig lidmate aan om hul gawes te gebruik in diens van God en die gemeenskap.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-sm font-bold">5</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Genade</h4>
                    <p className="text-muted-foreground">Ons verwelkom almal met ope arms, ongeag agtergrond of omstandighede.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Button asChild variant="outline">
                  <Link href="/diensgroepe">
                    <Users className="mr-2 h-4 w-4" />
                    Raak Betrokke
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed History */}
      <section className="py-16 bg-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-amber-900 mb-12 text-center">Ons Ryk Geskiedenis</h2>
          
          <div className="space-y-12">
            {/* 1960s */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-amber-800 mb-4">1960s - Die Begin</h3>
                <p className="text-muted-foreground mb-4">
                  In 1958 was daar maar enkele Gereformeerde lidmate woonagtig noord van die Magaliesberg 
                  en oos van die Apiesrivier. Die ontwikkeling van die gebied het so vinnig plaasgevind 
                  dat die Pretoria-Annlin gemeente in 1965 as onafhanklike gemeente kon afstig.
                </p>
                <p className="text-muted-foreground">
                  Ds. J.H. Boneschans is as die eerste predikant beroep en het van 1965 tot 1969 gedien.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h4 className="font-semibold text-amber-900 mb-3">Belangrike Datums</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stigtingsdatum:</span>
                    <span className="font-medium">16 Oktober 1965</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Eerste Predikant:</span>
                    <span className="font-medium">Ds. J.H. Boneschans</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Afgestig van:</span>
                    <span className="font-medium">Eloffsdal-Wonderboom-Suid</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 1970s */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div 
                className="h-64 bg-cover bg-center rounded-lg shadow-lg order-2 lg:order-1"
                style={{
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('/church-building-1974.jpg')`
                }}
              >
                <div className="h-full flex items-end p-6">
                  <div className="text-white">
                    <h4 className="font-bold text-lg">Kerkgebou 1974</h4>
                    <p className="text-sm text-gray-200">Ontwerp deur argitek Johan de Ridder</p>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h3 className="text-2xl font-bold text-amber-800 mb-4">1970s - Kerkbou</h3>
                <p className="text-muted-foreground mb-4">
                  Twee erwe is deur suster A.E. van der Linde geskenk, en 'n verdere 1 morg grond 
                  deur suster C.M van Deventer. Dit is die grond waarop die kerkgebou vandag staan.
                </p>
                <p className="text-muted-foreground">
                  In 1972 gee die kerkraad vir argitek Johan de Ridder opdrag om die kerkgebou te ontwerp. 
                  Die kerkgebou is op 20 April 1974 amptelik in gebruik geneem.
                </p>
              </div>
            </div>

            {/* Modern Era */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-amber-800 mb-4">Moderne Era - Groei en Uitbreiding</h3>
                <p className="text-muted-foreground mb-4">
                  Die gemeente het gegroei en in 1977 het Magalieskruin van ons afgeskei. 
                  In 1978 is die kerkgebou vergroot vanweë 'n steeds toenemende lidmaattal.
                </p>
                <p className="text-muted-foreground mb-4">
                  'n Kerksaal met plek vir 450 mense en 12 katkisasielokale is in 1981 in gebruik geneem.
                </p>
                <p className="text-muted-foreground">
                  Die sendingopdrag is hoog op ons prioriteit en lidmate is aktief met evangelisasie 
                  in eie omgewing, omliggende gebiede en in die buiteland.
                </p>
              </div>
              <div 
                className="h-64 bg-cover bg-center rounded-lg shadow-lg"
                style={{
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('/church-building-main.jpg')`
                }}
              >
                <div className="h-full flex items-end p-6">
                  <div className="text-white">
                    <h4 className="font-bold text-lg">Kerkgebou Vandag</h4>
                    <p className="text-sm text-gray-200">Die vergrote kerkgebou, 2019</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location and Contact */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-amber-900">Kom Besoek Ons</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Ons is geleë in die hart van Wonderboom, Pretoria
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card>
              <CardHeader>
                <CardTitle className="text-amber-900">Ligging</CardTitle>
                <CardDescription>
                  Ons kerkgebou en omgewing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Adres</h4>
                  <p className="text-muted-foreground">
                    H/v Braam Pretoriusstraat en Kaneelbaslaan<br />
                    Wonderboom, Pretoria<br />
                    0182
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Bedieningsgebied</h4>
                  <p className="text-muted-foreground text-sm">
                    Ons bedieningsgebied lê hoofsaaklik noord van die Magaliesbergreeks met die 
                    Apiesrivier as westelike grens, en sluit voorstede soos Annlin, Sinoville, 
                    Doornpoort en Wonderboom in.
                  </p>
                </div>

                <div className="pt-4">
                  <Button asChild className="w-full">
                    <a 
                      href="https://maps.google.com/search/Braam+Pretoriusstraat+Kaneelbaslaan+Wonderboom+Pretoria" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Bekyk op Kaart
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-amber-900">Fasiliteite</CardTitle>
                <CardDescription>
                  Wat ons aanbied
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Hoofkerk</h4>
                    <p className="text-muted-foreground">Eredienste en spesiale geleenthede</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Kerksaal</h4>
                    <p className="text-muted-foreground">450 sitplekke vir byeenkomste</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Katkisasielokale</h4>
                    <p className="text-muted-foreground">12 klaskamers vir onderrig</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Parkering</h4>
                    <p className="text-muted-foreground">Voldoende parkering beskikbaar</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-foreground mb-2">Toeganklikheid</h4>
                  <p className="text-muted-foreground text-sm">
                    Ons fasiliteite is toeganklik vir rolstoelgebruikers en ons verwelkom 
                    alle lidmate ongeag fisiese beperkings.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-amber-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Sluit by Ons Gemeente Familie Aan
            </h2>
            <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
              Ons nooi jou uit om deel te word van ons lewende gemeente waar geloof, 
              hoop en liefde saamkom.
            </p>
            <div className="space-x-4">
              <Button asChild size="lg" className="bg-white text-amber-800 hover:bg-amber-50">
                <Link href="/jaarprogram">
                  <Calendar className="mr-2 h-5 w-5" />
                  Besoek 'n Erediens
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-amber-800">
                <Link href="/kontak">
                  Kontak Ons
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
