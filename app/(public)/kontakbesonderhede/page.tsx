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
      <section className="bg-gradient-to-b from-amber-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
              Kontak Besonderhede
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto">
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
                    <Mail className="mr-2 h-5 w-5 text-amber-600" />
                    Algemene Kontak
                  </CardTitle>
                  <CardDescription>
                    Vir algemene navrae en inligting
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">E-pos</h4>
                      <a 
                        href="mailto:kerkkantoor@annlin.co.za"
                        className="text-amber-600 hover:text-amber-800 break-all"
                      >
                        kerkkantoor@annlin.co.za
                      </a>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Telefoon</h4>
                      <div className="space-y-2">
                        <div>
                          <a 
                            href="tel:012-567-1492"
                            className="text-amber-600 hover:text-amber-800"
                          >
                            012 567 1492
                          </a>
                          <p className="text-xs text-muted-foreground/70">Kerkkantoor</p>
                        </div>
                        <div>
                          <a 
                            href="tel:079-162-3453"
                            className="text-amber-600 hover:text-amber-800"
                          >
                            079 162 3453
                          </a>
                          <p className="text-xs text-muted-foreground/70">Selfoon</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Pos Adres</h4>
                    <p className="text-muted-foreground">
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
                    <MapPin className="mr-2 h-5 w-5 text-amber-600" />
                    Kerk Adres
                  </CardTitle>
                  <CardDescription>
                    Waar ons eredienste plaasvind
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Fisiese Adres</h4>
                      <p className="text-muted-foreground">
                        Gereformeerde Kerk Pretoria-Annlin<br />
                        H/v Braam Pretoriusstraat en Kaneelbaslaan<br />
                        Wonderboom, Pretoria<br />
                        0182
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
                    <Calendar className="mr-2 h-5 w-5 text-amber-600" />
                    Erediens Tye
                  </CardTitle>
                  <CardDescription>
                    Sluit by ons aan vir aanbidding
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-l-4 border-amber-600 pl-4">
                      <h4 className="font-medium text-foreground">Sondag Oggend</h4>
                      <p className="text-muted-foreground">08:30 - 09:30</p>
                      <p className="text-sm text-muted-foreground/70">Kinderkerk beskikbaar</p>
                    </div>
                    
                    <div className="border-l-4 border-amber-600 pl-4">
                      <h4 className="font-medium text-foreground">Sondag Aand</h4>
                      <p className="text-muted-foreground">18:30 - 19:30</p>
                      <p className="text-sm text-muted-foreground/70">Informele atmosfeer</p>
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
                    <Clock className="mr-2 h-5 w-5 text-amber-600" />
                    Kantoor Ure
                  </CardTitle>
                  <CardDescription>
                    Wanneer ons beskikbaar is
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Maandag - Vrydag</span>
                      <span className="font-medium text-foreground">09:00 - 15:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Saterdag</span>
                      <span className="font-medium text-foreground">Gesluit</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sondag</span>
                      <span className="font-medium text-foreground">Na eredienste</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Let wel:</strong> Los asseblief 'n boodskap indien ons nie dadelik antwoord nie en ons sal so gou as moontlik terugkom na jou toe.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5 text-amber-600" />
                    Personeel
                  </CardTitle>
                  <CardDescription>
                    Ons span wat jou kan help
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-foreground">Predikant</h4>
                      <p className="text-muted-foreground">Ds. Pieter Kurpershoek</p>
                      <p className="text-sm text-muted-foreground/70">Kontak via kerkkantoor</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-foreground">Kerkraad Voorsitter</h4>
                      <p className="text-muted-foreground">[Naam]</p>
                      <a 
                        href="tel:083-765-4321"
                        className="text-sm text-amber-600 hover:text-amber-800"
                      >
                        083 765 4321
                      </a>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-foreground">Administrateur</h4>
                      <p className="text-muted-foreground">[Naam]</p>
                      <a 
                        href="mailto:kerkkantoor@annlin.co.za"
                        className="text-sm text-amber-600 hover:text-amber-800"
                      >
                        kerkkantoor@annlin.co.za
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="mt-16 text-center">
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Gereed om ons te besoek?
                </h3>
                <p className="text-lg text-muted-foreground mb-6">
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
