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
            Annlin Website Development
          </h1>
          <p className="text-xl text-muted-foreground">
            Church website migration from WordPress to Next.js
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>UI Components Test</CardTitle>
              <CardDescription>
                Testing 21st.dev inspired components with proper design tokens
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-input">Test Input</Label>
                <Input id="test-input" placeholder="Enter some text..." />
              </div>
              <div className="flex gap-2">
                <Button>Primary Button</Button>
                <Button variant="outline">Outline Button</Button>
                <Button variant="secondary">Secondary</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Status</CardTitle>
              <CardDescription>
                Current progress on the church website migration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Foundation Setup</span>
                  <span className="text-sm text-muted-foreground">In Progress</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Next.js project initialized with TypeScript, Tailwind CSS, and core dependencies
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
