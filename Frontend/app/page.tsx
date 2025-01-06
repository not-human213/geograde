import Hero from "@/components/Hero"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/Spotlight"
import { TextGenerateEffect } from "@/components/ui/TextGenerateEffect"
import { MapPin, BarChart2, TreePine, Building2, Hospital, ShieldCheck, Zap } from 'lucide-react'
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundImage: "url('/bg.jpg')" }}>
      <header className="bg-primary text-primary-foreground py-4">
        <div className="container mx-auto px-4">
          <div>
            
                  <Spotlight
                    className="-top-40 -left-10 md:-left-32 md:-top-20 h-screen"
                    fill="white"
                  />
                  <Spotlight
                    className="h-[80vh] w-[50vw] top-10 left-full"
                    fill="purple"
                  />
                  <Spotlight className="left-80 top-28 h-[80vh] w-[50vw]" fill="blue" />
                </div>
          <nav className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="logo">
                <img src="/logo.png" alt="GeoGrade" width={125} height={125} />
              </div>
              <div className="text-2xl font-bold">
                <Link href="/" className="hover:underline">GeoGrade</Link>
              </div>
            </div>
            <div className="space-x-4">
              <Link href="#features" className="hover:underline">Features</Link>
              <Link href="#parameters" className="hover:underline">Parameters</Link>
              <Link href="#about" className="hover:underline">About</Link>
              <Link href="/map" className="hover:underline">Map</Link>
              <Link href="/compare" className="hover:underline">Compare</Link>
              <Link href="/features" className="hover:underline">All Features</Link>
              <Link href="/review" className="hover:underline">Review</Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        <section className="bg-gradient-to-b from-primary to-primary/50 text-primary-foreground py-20">
          <div className="container mx-auto px-4 text-center">
          
            <TextGenerateEffect
              words="Discover Your Ideal Neighbourhood"
              className="text-center text-[40px] md:text-5xl lg:text-6xl"
            />

          <p className="mt-4 text-center md:tracking-wider mb-4 text-sm md:text-lg lg:text-2xl">
            Analyze and compare areas based on key livability factors.
          </p>
          
            {/* <h1 className="text-4xl md:text-6xl font-bold mb-6">Discover Your Ideal Neighborhood</h1> */}
            <Button size="lg" asChild>
              <Link href="/map" className="transition-transform transform hover:scale-105">Try It Now</Link>
            </Button>
          </div>
        </section>

        <section id="features" className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<MapPin className="w-12 h-12" />}
                title="Interactive Map"
                description="Explore different areas with our user-friendly map interface"
              />
              <FeatureCard
                icon={<BarChart2 className="w-12 h-12" />}
                title="Comprehensive Scoring"
                description="Get detailed livability scores based on multiple factors"
              />
              <FeatureCard
                icon={<Zap className="w-12 h-12" />}
                title="Instant Results"
                description="Receive immediate analysis of your selected location"
              />
            </div>
            <div className="text-center mt-8">
              <Button asChild>
                <Link href="/features" className="transition-transform transform hover:scale-105">View All Features</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="parameters" className="bg-muted py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Area Quality Parameters</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <ParameterCard icon={<TreePine />} title="Forest Cover" description="Percentage of area covered by forests" />
              <ParameterCard icon={<Building2 />} title="GDP" description="Gross Domestic Product per capita" />
              <ParameterCard icon={<Hospital />} title="Healthcare" description="Number of nearby hospitals" />
              <ParameterCard icon={<ShieldCheck />} title="Safety" description="Crime rate and nearby police stations" />
              <ParameterCard icon={<MapPin />} title="Parks" description="Number of nearby parks and recreational areas" />
              <ParameterCard icon={<BarChart2 />} title="Literacy Rate" description="Percentage of literate population" />
            </div>
            <div className="text-center mt-8">
              <Button asChild>
                <Link href="/parameters" className="transition-transform transform hover:scale-105">View All Parameters</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="about" className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">About GeoGrade</h2>
            <p className="max-w-2xl mx-auto text-lg mb-8">
              Our mission is to help you make informed decisions about where to live, work, or invest. 
              By combining various data points and advanced analytics, we provide a comprehensive 
              view of an area's livability, empowering you to choose the best location for your needs.
            </p>
            <Button asChild>
              <Link href="/map" className="transition-transform transform hover:scale-105">Start Exploring</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4 text-center">
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="transition-transform transform hover:scale-105 hover:shadow-lg">
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

function ParameterCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="transition-transform transform hover:scale-105 hover:shadow-lg">
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
