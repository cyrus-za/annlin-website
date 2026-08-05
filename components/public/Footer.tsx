import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Mail, MapPin, Phone, Radio, Youtube } from 'lucide-react'
import { APP_CONFIG } from '@/lib/constants'

export function Footer() {
  const currentYear = new Date().getFullYear()
  const contactEmailHref = `mailto:${APP_CONFIG.email}`

  return (
    <footer className="bg-amber-900 text-amber-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          {/* Church Information */}
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex w-full max-w-48 overflow-hidden rounded-lg bg-white ring-1 ring-amber-500/40 md:max-w-64"
              aria-label="Gereformeerde Kerk Pretoria-Annlin tuisblad"
            >
              <Image
                src="/annlin-logo.png"
                alt="Gereformeerde Kerk Pretoria-Annlin"
                width={800}
                height={494}
                className="h-auto w-full"
              />
            </Link>
            <div className="flex items-center gap-3 text-xs text-amber-300">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white ring-1 ring-amber-500/40">
                <Image
                  src="/gksa-logo.png"
                  alt="Gereformeerde Kerke in Suid-Afrika"
                  width={36}
                  height={36}
                  className="h-8 w-8 object-contain"
                />
              </div>
              <span>Deel van die Gereformeerde Kerke in Suid-Afrika</span>
            </div>
            <p className="hidden text-sm text-amber-200 md:block">
              Geroep tot 'n lewende geloof in God-Drie-Enig waar almal hul gawes tot Sy eer gebruik.
            </p>
            <div className="flex items-center gap-1">
              <a 
                href="https://www.youtube.com/@gereformeerdekerkpretoria-813" 
                target="_blank"
                rel="noopener noreferrer"
                className="-ml-3 flex h-11 w-11 items-center justify-center text-amber-300 transition-colors hover:text-white"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="https://kerkdienstgemist.nl/stations/1246"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center text-amber-300 transition-colors hover:text-white"
                aria-label="Luister op Kerkdienstgemist"
                title="Kerkdienstgemist"
              >
                <Radio className="h-5 w-5" />
              </a>
              <a
                href="https://www.facebook.com/p/Gereformeerde-Kerk-Pretoria-Annlin-100064804023820/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center text-amber-300 transition-colors hover:text-white"
                aria-label="Volg GK Pretoria-Annlin op Facebook"
                title="Facebook"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
                  <path d="M14 8h3V4h-3a6 6 0 0 0-6 6v2H5v4h3v8h4v-8h3l1-4h-4v-2a2 2 0 0 1 2-2Z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Kontak Besonderhede</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-amber-400 mt-1 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-amber-200">
                    H/v Braam Pretoriusstraat en<br />
                    Kaneelbaslaan, Wonderboom<br />
                    Pretoria, 0182
                  </p>
                </div>
              </div>
              
              <a
                href="tel:012-567-1492"
                className="flex min-h-11 items-center space-x-3 text-sm text-amber-200 transition-colors hover:text-white"
              >
                <Phone className="h-4 w-4 text-amber-400" />
                <span>012 567 1492</span>
              </a>
              
              <a
                href={contactEmailHref}
                className="flex min-h-11 items-center space-x-3 text-sm text-amber-200 transition-colors hover:text-white"
              >
                <Mail className="h-4 w-4 text-amber-400" />
                <span>{APP_CONFIG.email}</span>
              </a>
            </div>
          </div>

          {/* Service Times */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Erediens Tye</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Calendar className="h-4 w-4 text-amber-400 mt-1" />
                <div className="text-sm">
                  <p className="text-white font-medium">Sondag Oggend</p>
                  <p className="text-amber-200">08:30 - 09:30</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Calendar className="h-4 w-4 text-amber-400 mt-1" />
                <div className="text-sm">
                  <p className="text-white font-medium">Sondag Aand</p>
                  <p className="text-amber-200">18:30 - 19:30</p>
                </div>
              </div>
              
            </div>
          </div>

          {/* Quick Links */}
          <div className="hidden space-y-4 md:block">
            <h3 className="text-lg font-semibold text-white">Vinnige Skakels</h3>
            <div className="space-y-2">
              <Link 
                href="/jaarprogram"
                className="flex min-h-9 items-center text-sm text-amber-200 transition-colors hover:text-white"
              >
                Kalender & Gebeure
              </Link>
              <Link 
                href="/uitsendings"
                className="flex min-h-9 items-center text-sm text-amber-200 transition-colors hover:text-white"
              >
                Video Uitsendings
              </Link>
              <Link 
                href="/diensgroepe"
                className="flex min-h-9 items-center text-sm text-amber-200 transition-colors hover:text-white"
              >
                Raak Betrokke
              </Link>
              <Link 
                href="/nuus"
                className="flex min-h-9 items-center text-sm text-amber-200 transition-colors hover:text-white"
              >
                Nuus & Aankondigings
              </Link>
              <Link 
                href="/leesstof"
                className="flex min-h-9 items-center text-sm text-amber-200 transition-colors hover:text-white"
              >
                Hulpbronne
              </Link>
              <Link 
                href="/uitsendings"
                className="flex min-h-9 items-center text-sm text-amber-200 transition-colors hover:text-white"
              >
                Luister na Preke
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 border-t border-amber-800 pt-6 md:mt-12 md:pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-sm text-amber-300">
                © {currentYear} Gereformeerde Kerk Pretoria-Annlin. Alle regte voorbehou.
              </p>
              <p className="text-xs text-amber-400 mt-1">
                Gebou met liefde vir ons gemeente gemeenskap
              </p>
            </div>
            
            <div className="flex items-center space-x-6 text-xs text-amber-400">
              <Link href="/privaatheid" className="inline-flex min-h-11 items-center transition-colors hover:text-white">
                Privaatheid Beleid
              </Link>
              <Link href="/gebruiksvoorwaardes" className="inline-flex min-h-11 items-center transition-colors hover:text-white">
                Gebruiksvoorwaardes
              </Link>
              <Link href="/admin" className="inline-flex min-h-11 items-center transition-colors hover:text-white">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
