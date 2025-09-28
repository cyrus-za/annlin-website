import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Church } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          {/* Main Loading Content */}
          <Card className="w-full max-w-md mx-auto shadow-lg border-amber-100">
            <CardContent className="p-8">
              <div className="text-center">
                {/* Church Icon */}
                <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6 relative">
                  <Church className="h-8 w-8 text-amber-600" />
                  {/* Animated Ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-amber-200 border-t-amber-600 animate-spin"></div>
                </div>
                
                {/* Loading Text */}
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Laai Tans...
                </h2>
                <p className="text-gray-600 mb-6">
                  Ons berei die inhoud voor jou voor
                </p>
                
                {/* Animated Loading Indicator */}
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-5 w-5 text-amber-600 animate-spin" />
                  <span className="text-sm text-gray-500">
                    Een oomblik asseblief...
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Loading Elements */}
          <div className="mt-8 w-full max-w-2xl">
            {/* Skeleton Loading Bars */}
            <div className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Subtle Animation Dots */}
          <div className="mt-8 flex space-x-2">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>

        {/* Optional: Loading Tips */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-500">
            Terwyl jy wag, onthou dat ons eredienste Sondae om 08:30 en 18:30 is
          </p>
        </div>
      </div>
    </div>
  )
}
