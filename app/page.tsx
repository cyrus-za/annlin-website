import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Annlin Webwerf Ontwikkeling
          </h1>
          <p className="text-xl text-muted-foreground">
            Kerkwebwerf migrasie van WordPress na Next.js
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>UI Komponente Toets</CardTitle>
              <CardDescription>
                Toets van 21st.dev geïnspireerde komponente met behoorlike ontwerp tokens
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-input">Toets Invoer</Label>
                <Input id="test-input" placeholder="Voer teks in..." />
              </div>
              <div className="flex gap-2">
                <Button>Primêre Knoppie</Button>
                <Button variant="outline">Omlyn Knoppie</Button>
                <Button variant="secondary">Sekondêr</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Projek Status</CardTitle>
              <CardDescription>
                Huidige vordering op die kerkwebwerf migrasie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Grondslag Opstelling</span>
                  <span className="text-sm text-muted-foreground">In Proses</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Next.js projek geïnisialiseer met TypeScript, Tailwind CSS, en kern afhanklikhede
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
