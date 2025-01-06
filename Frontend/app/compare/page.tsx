'use client'

import { useState } from 'react'
import Map from '@/components/Map'
import Link from 'next/link'

export default function ComparePage() {
  const [location1, setLocation1] = useState<{
    lat: number
    lon: number
    address: string
  } | undefined>()

  const [location2, setLocation2] = useState<{
    lat: number
    lon: number
    address: string
  } | undefined>()

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundImage: "url('/bg.jpg')" }}>
      <header className="bg-primary text-primary-foreground py-4">
        <div className="container mx-auto px-4">
          <nav className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold">GeoGrade</Link>
            <div className="space-x-4">
              <Link href="/" className="hover:underline">Home</Link>
              <Link href="/map" className="hover:underline">Map</Link>
              <Link href="/features" className="hover:underline">Features</Link>
              <Link href="/parameters" className="hover:underline">Parameters</Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Compare Two Locations</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Location 1</h2>
            <Map onLocationSelect={(lat, lon, address) => setLocation1({ lat, lon, address })} />
            <div className="mt-4">
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Location 2</h2>
            <Map onLocationSelect={(lat, lon, address) => setLocation2({ lat, lon, address })} />
            <div className="mt-4">
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-primary text-primary-foreground py-4">
        <div className="container mx-auto px-4 text-center">
        </div>
      </footer>
    </div>
  )
}

