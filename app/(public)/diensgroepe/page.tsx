import { ServiceGroups } from '@/components/public/ServiceGroups'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Diensgroepe | Annlin Gemeente',
  description: 'Raak betrokke by ons verskillende diensgroepe en bedienings. Help maak \'n verskil in ons gemeente.',
  keywords: ['diensgroepe', 'bedienings', 'gemeente', 'betrokkenheid', 'vrywilligers'],
}

export default function DiensgroepePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-amber-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
              Diensgroepe
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto">
              By Annlin Gemeente glo ons dat elke lidmaat 'n belangrike rol het om te speel. 
              Ons diensgroepe bied geleenthede vir jou om jou talente te gebruik en 'n verskil 
              te maak in ons gemeente en gemeenskap.
            </p>
          </div>
        </div>
      </section>

      {/* Service Groups Grid */}
      <ServiceGroups showAll={true} />

      {/* Call to Action */}
      <section className="py-16 bg-amber-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Gereed om betrokke te raak?
            </h2>
            <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
              Kontak ons vandag om uit te vind hoe jy by een van ons diensgroepe kan aansluit.
            </p>
            <div className="space-x-4">
              <a
                href="/kontak"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-amber-600 bg-white hover:bg-amber-50 transition-colors duration-200"
              >
                Kontak Ons
              </a>
              <a
                href="tel:012-567-1492"
                className="inline-flex items-center px-6 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-amber-600 transition-colors duration-200"
              >
                Bel Ons: 012 567 1492
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Information Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Waarom by 'n diensgroep aansluit?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 bg-amber-600 rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-foreground">Maak 'n Verskil</h3>
                    <p className="text-muted-foreground">
                      Gebruik jou talente en passies om 'n positiewe impak te maak in ons gemeente en gemeenskap.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 bg-amber-600 rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-foreground">Bou Verhoudings</h3>
                    <p className="text-muted-foreground">
                      Ontmoet nuwe mense en bou betekenisvolle vriendskappe met ander wat dieselfde waardes deel.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 bg-amber-600 rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-foreground">Groei Geestelik</h3>
                    <p className="text-muted-foreground">
                      Ontwikkel jou geloof en geestelike gawes deur diensbaarheid en samewerking met ander.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold text-foreground mb-6">
                Hoe om aan te sluit
              </h3>
              <div className="space-y-4">
                <div className="border-l-4 border-amber-600 pl-4">
                  <h4 className="font-semibold text-foreground">Stap 1: Kies 'n Diensgroep</h4>
                  <p className="text-muted-foreground text-sm">
                    Kyk deur ons verskillende diensgroepe en kies een wat by jou belangstellings pas.
                  </p>
                </div>
                
                <div className="border-l-4 border-amber-600 pl-4">
                  <h4 className="font-semibold text-foreground">Stap 2: Maak Kontak</h4>
                  <p className="text-muted-foreground text-sm">
                    Gebruik die kontak besonderhede om die diensgroep leier te kontak.
                  </p>
                </div>
                
                <div className="border-l-4 border-amber-600 pl-4">
                  <h4 className="font-semibold text-foreground">Stap 3: Sluit Aan</h4>
                  <p className="text-muted-foreground text-sm">
                    Kom na die volgende byeenkoms en begin jou reis van diensbaarheid!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
