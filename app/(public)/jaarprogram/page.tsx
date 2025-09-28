import { PublicCalendar } from '@/components/public/Calendar'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Jaarprogram | Annlin Gemeente',
  description: 'Bekyk ons kerk kalender met vergaderings, gebeurtenisse en belangrike datums. Bly op hoogte met wat gebeur by Annlin Gemeente.',
  keywords: ['jaarprogram', 'kalender', 'vergaderings', 'gebeure', 'kerk', 'Annlin Gemeente'],
}

export default function JaarprogramPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-amber-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
              Jaarprogram
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto">
              Bly op hoogte met al ons vergaderings, spesiale gebeure en belangrike datums. 
              Ons nooi jou uit om deel te wees van ons gemeente aktiwiteite.
            </p>
          </div>
        </div>
      </section>

      {/* Calendar Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PublicCalendar />
        </div>
      </section>

      {/* Information Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Gereelde Vergaderings & Gebeure
              </h2>
              <div className="space-y-6">
                <div className="border-l-4 border-amber-600 pl-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2">Kerkraad Vergaderings</h3>
                  <p className="text-muted-foreground mb-2">Maandeliks</p>
                  <p className="text-sm text-muted-foreground/70">
                    Bestuur en beplanning van kerk aktiwiteite. 
                    Alle kerkraad lede word verwelkom.
                  </p>
                </div>
                
                <div className="border-l-4 border-amber-600 pl-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2">Jeugbediening Vergaderings</h3>
                  <p className="text-muted-foreground mb-2">Weekliks</p>
                  <p className="text-sm text-muted-foreground/70">
                    Beplanning en koördinasie van jeug aktiwiteite. 
                    Aktiewe jeugleiers is welkom.
                  </p>
                </div>
                
                <div className="border-l-4 border-amber-600 pl-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2">Diensgroep Vergaderings</h3>
                  <p className="text-muted-foreground mb-2">Maandeliks</p>
                  <p className="text-sm text-muted-foreground/70">
                    Koördinasie van verskillende diensgroepe en hul aktiwiteite. 
                    Alle diensgroep leiers is welkom.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-foreground mb-6">
                Spesiale Gebeure
              </h3>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="font-semibold text-foreground mb-2">Jeugkampe</h4>
                  <p className="text-muted-foreground text-sm">
                    Jaarliks hou ons spesiale kampe vir ons jeug met aktiwiteite, 
                    aanbidding en geleenthede om nuwe vriende te maak.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="font-semibold text-foreground mb-2">Gemeente Uitstappies</h4>
                  <p className="text-muted-foreground text-sm">
                    Gereelde uitstappies en sosiale geleenthede vir die hele gemeente 
                    om saam te kom en verhoudings te bou.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="font-semibold text-foreground mb-2">Spesiale Eredienste</h4>
                  <p className="text-muted-foreground text-sm">
                    Kersfees, Paasfees en ander spesiale eredienste met 
                    besondere programme en gasspreker.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-amber-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Sluit by Ons Aan
            </h2>
            <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
              Al ons gebeure is oop vir die publiek. Kom soos jy is - jy is altyd welkom!
            </p>
            <div className="space-x-4">
              <a
                href="/kontak"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-amber-800 bg-white hover:bg-amber-50 transition-colors duration-200"
              >
                Kontak Ons vir Meer Info
              </a>
              <a
                href="/diensgroepe"
                className="inline-flex items-center px-6 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-amber-800 transition-colors duration-200"
              >
                Raak Betrokke
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
