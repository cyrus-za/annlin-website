import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Mail, Phone, MapPin, Clock, Calendar, Users, Send } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kontak Besonderhede | Annlin Gemeente',
  description: 'Kontak besonderhede vir Annlin Gemeente. Vind ons adres, telefoon nommers, kantoor ure en erediens tye.',
  keywords: ['kontak', 'adres', 'telefoon', 'eredienste', 'kantoor ure', 'Annlin Gemeente'],
}

export default function ContactDetailsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              Kontak Besonderhede
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              Ons is hier vir jou. Kontak ons vir enige navrae, pastorale sorg, of as jy 
              net wil gesels. Ons verwelkom jou met ope arms.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Main Contact Info */}
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="mr-2 h-5 w-5 text-blue-600" />
                    Algemene Kontak
                  </CardTitle>
                  <CardDescription>
                    Vir algemene navrae en inligting
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">E-pos</h4>
                      <a 
                        href="mailto:info@annlin-gemeente.co.za"
                        className="text-blue-600 hover:text-blue-800 break-all"
                      >
                        info@annlin-gemeente.co.za
                      </a>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Telefoon</h4>
                      <a 
                        href="tel:012-345-6789"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        012 345 6789
                      </a>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Pos Adres</h4>
                    <p className="text-gray-600">
                      Annlin Gemeente<br />
                      Posbus 12345<br />
                      Pretoria, 0001
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-blue-600" />
                    Kerk Adres
                  </CardTitle>
                  <CardDescription>
                    Waar ons eredienste plaasvind
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Fisiese Adres</h4>
                      <p className="text-gray-600">
                        Annlin Gemeente<br />
                        [Straat Adres]<br />
                        Annlin, Pretoria<br />
                        0181
                      </p>
                    </div>
                    
                    <div>
                      <Button asChild variant="outline" className="w-full">
                        <a 
                          href="https://maps.google.com" 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <MapPin className="mr-2 h-4 w-4" />
                          Bekyk op Kaart
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Service Times and Staff */}
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-blue-600" />
                    Erediens Tye
                  </CardTitle>
                  <CardDescription>
                    Sluit by ons aan vir aanbidding
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-600 pl-4">
                      <h4 className="font-medium text-gray-900">Sondag Oggend</h4>
                      <p className="text-gray-600">09:00 - Hooferediens</p>
                      <p className="text-sm text-gray-500">Kinderkerk beskikbaar</p>
                    </div>
                    
                    <div className="border-l-4 border-blue-600 pl-4">
                      <h4 className="font-medium text-gray-900">Sondag Aand</h4>
                      <p className="text-gray-600">18:00 - Aanderediens</p>
                      <p className="text-sm text-gray-500">Informele atmosfeer</p>
                    </div>
                    
                    <div className="border-l-4 border-blue-600 pl-4">
                      <h4 className="font-medium text-gray-900">Woensdag</h4>
                      <p className="text-gray-600">19:00 - Biduur & Bybelstudie</p>
                      <p className="text-sm text-gray-500">Alle ouderdomme welkom</p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button asChild className="w-full">
                      <Link href="/jaarprogram">
                        <Calendar className="mr-2 h-4 w-4" />
                        Bekyk Volledige Kalender
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-blue-600" />
                    Kantoor Ure
                  </CardTitle>
                  <CardDescription>
                    Wanneer ons beskikbaar is
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Maandag - Vrydag</span>
                      <span className="font-medium text-gray-900">08:00 - 16:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Saterdag</span>
                      <span className="font-medium text-gray-900">08:00 - 12:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sondag</span>
                      <span className="font-medium text-gray-900">Na eredienste</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Let wel:</strong> Kantoor ure kan verander tydens vakansies. 
                      Bel vooraf om seker te maak iemand is beskikbaar.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5 text-blue-600" />
                    Personeel
                  </CardTitle>
                  <CardDescription>
                    Ons span wat jou kan help
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900">Dominee</h4>
                      <p className="text-gray-600">Ds. [Naam]</p>
                      <a 
                        href="tel:082-123-4567"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        082 123 4567
                      </a>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900">Kerkraad Voorsitter</h4>
                      <p className="text-gray-600">[Naam]</p>
                      <a 
                        href="tel:083-765-4321"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        083 765 4321
                      </a>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900">Administrateur</h4>
                      <p className="text-gray-600">[Naam]</p>
                      <a 
                        href="mailto:admin@annlin-gemeente.co.za"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        admin@annlin-gemeente.co.za
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="mt-16 text-center">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Gereed om ons te besoek?
                </h3>
                <p className="text-lg text-gray-600 mb-6">
                  Ons verwelkom jou met ope arms. Kom soos jy is - geen formele kleredrag nodig nie!
                </p>
                <div className="space-x-4">
                  <Button asChild size="lg">
                    <Link href="/kontak">
                      <Send className="mr-2 h-5 w-5" />
                      Stuur 'n Boodskap
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/diensgroepe">
                      <Users className="mr-2 h-5 w-5" />
                      Bekyk Diensgroepe
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
