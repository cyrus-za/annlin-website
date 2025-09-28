import Link from 'next/link'
import { Mail, Phone, MapPin, Calendar, Facebook, Youtube } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-amber-900 text-amber-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Church Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-amber-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">GK</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Annlin Gemeente</h3>
                <p className="text-xs text-amber-300">Gereformeerde Kerk Pretoria-Annlin</p>
              </div>
            </div>
            <p className="text-sm text-amber-200">
              Geroep tot 'n lewende geloof in God-Drie-Enig waar almal hul gawes tot Sy eer gebruik.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-amber-300 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="https://kerkdienstgemist.nl/streams/1029138" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-300 hover:text-white transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
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
              
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-amber-400" />
                <a 
                  href="tel:012-567-1492"
                  className="text-sm text-amber-200 hover:text-white transition-colors"
                >
                  012 567 1492
                </a>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-amber-400" />
                <a 
                  href="mailto:kerkkantoor@annlin.co.za"
                  className="text-sm text-amber-200 hover:text-white transition-colors"
                >
                  kerkkantoor@annlin.co.za
                </a>
              </div>
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
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Vinnige Skakels</h3>
            <div className="space-y-2">
              <Link 
                href="/jaarprogram"
                className="block text-sm text-amber-200 hover:text-white transition-colors"
              >
                Kalender & Gebeure
              </Link>
              <Link 
                href="/uitsendings"
                className="block text-sm text-amber-200 hover:text-white transition-colors"
              >
                Video Uitsendings
              </Link>
              <Link 
                href="/diensgroepe"
                className="block text-sm text-amber-200 hover:text-white transition-colors"
              >
                Raak Betrokke
              </Link>
              <Link 
                href="/nuus"
                className="block text-sm text-amber-200 hover:text-white transition-colors"
              >
                Nuus & Aankondigings
              </Link>
              <Link 
                href="/leesstof"
                className="block text-sm text-amber-200 hover:text-white transition-colors"
              >
                Preke & Leesstof
              </Link>
              <a 
                href="https://kerkdienstgemist.nl/streams/1029138"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-amber-200 hover:text-white transition-colors"
              >
                Luister na Preke
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-amber-800">
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
              <Link href="/privaatheid" className="hover:text-white transition-colors">
                Privaatheid Beleid
              </Link>
              <Link href="/gebruiksvoorwaardes" className="hover:text-white transition-colors">
                Gebruiksvoorwaardes
              </Link>
              <Link href="/admin" className="hover:text-white transition-colors">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
