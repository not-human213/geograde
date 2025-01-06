import Link from 'next/link'
import { TreePine, Building2, Hospital, ShieldCheck, MapPin, BarChart2, Droplets, Zap, Car, GraduationCap, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ParametersPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-primary-foreground py-4">
        <div className="container mx-auto px-4">
          <nav className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold">GeoGrade</Link>
            <div className="space-x-4">
              <Link href="/" className="hover:underline">Home</Link>
              <Link href="/map" className="hover:underline">Map</Link>
              <Link href="/compare" className="hover:underline">Compare</Link>
              <Link href="/features" className="hover:underline">Features</Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Area Quality Parameters</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <ParameterCard icon={<TreePine />} title="Forest Cover" description="Percentage of area covered by forests, indicating environmental health and access to nature." />
          <ParameterCard icon={<Building2 />} title="GDP" description="Gross Domestic Product per capita, reflecting the economic output and potential prosperity of the area." />
          <ParameterCard icon={<Hospital />} title="Healthcare" description="Number of nearby hospitals and healthcare facilities, indicating access to medical services." />
          <ParameterCard icon={<ShieldCheck />} title="Safety" description="Crime rate and number of nearby police stations, reflecting the overall safety of the area." />
          <ParameterCard icon={<MapPin />} title="Parks" description="Number of nearby parks and recreational areas, indicating opportunities for leisure and outdoor activities." />
          <ParameterCard icon={<BarChart2 />} title="Literacy Rate" description="Percentage of literate population, reflecting the educational level and opportunities in the area." />
          <ParameterCard icon={<Droplets />} title="Water Quality" description="Measures of local water quality and access to clean water sources." />
          <ParameterCard icon={<Zap />} title="Air Quality" description="Air quality index, measuring the cleanliness of the air and potential health impacts." />
          <ParameterCard icon={<Car />} title="Transportation" description="Availability and quality of public transportation and road infrastructure." />
          <ParameterCard icon={<GraduationCap />} title="Education" description="Number and quality of educational institutions in the area." />
        </div>
      </main>

      <footer className="bg-primary text-primary-foreground py-4">
        <div className="container mx-auto px-4 text-center">
        </div>
      </footer>
    </div>
  )
}

function ParameterCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="transition-transform transform hover:scale-105 hover:shadow-lg duration-300 ease-in-out">
      <CardHeader>
        <div className="mb-2 flex items-center space-x-2">
          {icon}
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  )
}
