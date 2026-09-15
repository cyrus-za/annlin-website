import { Navigation } from '@/components/public/Navigation'
import { Footer } from '@/components/public/Footer'
import { FeatureRequestWidget } from '@/components/feature-requests/FeatureRequestWidget'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="public-site min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <FeatureRequestWidget />
    </div>
  )
}
