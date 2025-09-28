import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, User, ExternalLink } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Uitsendings | Annlin Gemeente',
  description: 'Onlangse video uitsendings van eredienste. Slegs erediens video uitsendings van die afgelope 2 maande is beskikbaar.',
}

// Mock data - this would come from your CMS/database
const recentSermons = [
  {
    id: 1,
    title: "Strome Lewende Water...",
    scripture: "Johannes 7",
    date: "31 Augustus 2025",
    service: "Oggenderediens",
    duration: "45 min",
    pastor: "Ds. Pieter Kurpershoek",
    description: "In hierdie preek word die belangrike waarheid van lewende water ondersoek.",
    videoUrl: "#", // Would link to actual video
    isRecent: true
  },
  {
    id: 2,
    title: "Die Genade van Geloof",
    scripture: "Romeine 12:1-8",
    date: "24 Augustus 2025",
    service: "Oggenderediens",
    duration: "42 min",
    pastor: "Ds. Pieter Kurpershoek",
    description: "Ons kyk na hoe genade en geloof saamwerk in die Christen se lewe.",
    videoUrl: "#",
    isRecent: true
  },
  {
    id: 3,
    title: "Wat maak jy met jou geld en tyd?",
    scripture: "1 Korintiërs 16:1-14",
    date: "17 Augustus 2025",
    service: "Oggenderediens",
    duration: "38 min",
    pastor: "Ds. Pieter Kurpershoek",
    description: "Praktiese riglyne vir die bestuur van ons hulpbronne.",
    videoUrl: "#",
    isRecent: true
  },
  {
    id: 4,
    title: "In watter mate is JY persoonlik met Jesus besig en op Jesus gerig?",
    scripture: "Lukas 12:35-48",
    date: "10 Augustus 2025",
    service: "Oggenderediens",
    duration: "41 min",
    pastor: "Ds. Pieter Kurpershoek",
    description: "Diepgaande besinning oor persoonlike geestelike groei.",
    videoUrl: "#",
    isRecent: true
  },
  {
    id: 5,
    title: "Ek beloof om as 'n lewende lid van die kerk my gawes aan te wend",
    scripture: "1 Korintiërs 12:1-13",
    date: "3 Augustus 2025",
    service: "Oggenderediens",
    duration: "39 min",
    pastor: "Ds. Pieter Kurpershoek",
    description: "Die belangrikheid van aktiewe gemeentelidmaatskap.",
    videoUrl: "#",
    isRecent: true
  }
]

export default function UitsendingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
            Onlangse Video Uitsendings
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto">
            Slegs erediens video uitsendings van die afgelope 2 maande is beskikbaar op hierdie webtuiste. 
            Indien u na 'n spesifieke uitsending soek wat voor dit uitgesaai is, kan u met die kerkkantoor skakel.
          </p>
        </div>

        {/* Notice */}
        <div className="bg-amber-100 border border-amber-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-foreground">
                Belangrike Inligting
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Indien u na 'n spesifieke uitsending soek wat voor die afgelope 2 maande uitgesaai is, 
                kan u met die kerkkantoor skakel of eenvoudig die eposvormpie op die Kontakbesonderhede-blad invul.
              </p>
            </div>
          </div>
        </div>

        {/* Sermons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentSermons.map((sermon) => (
            <Card key={sermon.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg leading-tight">
                      {sermon.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {sermon.scripture}
                    </CardDescription>
                  </div>
                  {sermon.isRecent && (
                    <Badge variant="secondary" className="bg-amber-100 text-foreground">
                      Onlangs
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Service Info */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    {sermon.date}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    {sermon.service} • {sermon.duration}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="h-4 w-4 mr-2" />
                    {sermon.pastor}
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground">
                  {sermon.description}
                </p>

                {/* Action Button */}
                <Button asChild className="w-full bg-amber-600 hover:bg-amber-700">
                  <a href={sermon.videoUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Kyk Video
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Soek jy 'n spesifieke uitsending?
              </h3>
              <p className="text-muted-foreground mb-6">
                Indien u na 'n uitsending soek wat nie hier beskikbaar is nie, 
                kontak ons gerus vir hulp.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="outline">
                  <a href="/kontakbesonderhede">
                    Kontak Besonderhede
                  </a>
                </Button>
                <Button asChild>
                  <a href="/kontak">
                    Stuur 'n Boodskap
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
