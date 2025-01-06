import Link from 'next/link'
import { MapPin, BarChart2, ContrastIcon as Compare, Search, FileText, MapIcon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function FeaturesPage() {
  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundImage: "url('/bg.jpg')" }}>
      <header className="bg-primary text-primary-foreground py-4">
        <div className="container mx-auto px-4">
          <nav className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold">GeoGrade</Link>
            <div className="space-x-4">
              <Link href="/" className="hover:underline">Home</Link>
              <Link href="/map" className="hover:underline">Map</Link>
              <Link href="/compare" className="hover:underline">Compare</Link>
              <Link href="/parameters" className="hover:underline">Parameters</Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Features</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<MapPin className="w-12 h-12" />}
            title="Pinpoint Location Analysis"
            description="Get detailed reports and scores for any specific location you select on the map."
          />
          <FeatureCard
            icon={<MapIcon className="w-12 h-12" />}
            title="Custom Area Selection"
            description="Draw custom polygons on the map to analyze larger areas or specific shapes."
          />
          <FeatureCard
            icon={<Compare className="w-12 h-12" />}
            title="Location Comparison"
            description="Compare livability scores and parameters between two different locations side by side."
          />
          <FeatureCard
            icon={<Search className="w-12 h-12" />}
            title="City and State Search"
            description="Easily find and analyze any city or state by using our search functionality."
          />
          <FeatureCard
            icon={<BarChart2 className="w-12 h-12" />}
            title="Comprehensive Scoring"
            description="Our livability score takes into account multiple factors for a holistic view of each area."
          />
          <FeatureCard
            icon={<FileText className="w-12 h-12" />}
            title="Detailed Reports"
            description="Access in-depth reports for each location, including breakdowns of all contributing factors."
          />
        </div>
      </main>

      <footer className="bg-primary text-primary-foreground py-4">
        <div className="container mx-auto px-4 text-center">
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card>
      <CardHeader>
        <div className="mb-4 flex items-center justify-center">{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  )
}

