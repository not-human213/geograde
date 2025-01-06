import React, { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OLA_MAPS_API_KEY } from "@/utils/ola-maps";
import { OlaMaps } from "@/OlaMapsWebSDK";
import { calculateScore, getLocationReports, getAreaStories } from "@/lib/api";
import { ScoreDisplay } from "./ScoreDisplay";
import { LocationReports } from "./LocationReports";
import { AreaStories } from "./AreaStories";
import { Skeleton } from "@/components/ui/skeleton";
import { ParameterDisplay } from "./ParameterDisplay";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface MapProps {
  onLocationSelect: (lat: number, lon: number, address: string) => void;
  userType: string;
}

const olaMaps = new OlaMaps({
  apiKey: OLA_MAPS_API_KEY || "",
});

const Map: React.FC<MapProps> = ({ onLocationSelect, userType }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [scores, setScores] = useState<any>(null);
  const [reports, setReports] = useState<any>(null);
  const [stories, setStories] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [areaDetails, setAreaDetails] = useState<any>(null);

  const removeExistingMarker = () => {
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  };

  let flag = 1;
  useEffect(() => {
    if (flag > 1) {
      return;
    }
    console.log("Component mounted");
    console.log(flag);
    flag += 1;

    if (mapRef.current) {
      const mapOptions = {
        style: "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json",
        container: mapRef.current,
        center: [77.61648476788898, 12.931423492103944],
        zoom: 12,
      };

      mapInstance.current = olaMaps.init(mapOptions);

      if (mapInstance.current) {
        console.log("Map initialized successfully");
      } else {
        console.error("Failed to initialize map");
      }

      const handleMapClick = (event: any) => {
        const { lng, lat } = event.lngLat;
        console.log(`Clicked coordinates: ${lng}, ${lat}`);

        removeExistingMarker();

        const newMarker = olaMaps
          .addMarker({
            color: "red",
            draggable: true,
          })
          .setLngLat([lng, lat])
          .addTo(mapInstance.current);

        markerRef.current = newMarker;

        handleLocationSelect(lat, lng);
      };

      mapInstance.current.on("click", handleMapClick);

      return () => {
        removeExistingMarker();
        if (mapInstance.current) {
          mapInstance.current.off("click", handleMapClick);
        }
      };
    }
  }, []);

  const handleSearch = async () => {
    if (searchQuery) {
      try {
        const response = await fetch(`https://api.olamaps.io/places/v1/geocode?address=${searchQuery}&api_key=${OLA_MAPS_API_KEY}`);

        if (response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await response.json();

            if (data && data.geocodingResults && data.geocodingResults.length > 0) {
              const { lat, lng } = data.geocodingResults[0].geometry.location;
              const formattedAddress = data.geocodingResults[0].formatted_address;

              mapInstance.current.setCenter([lng, lat]);

              removeExistingMarker();

              const newMarker = olaMaps
                .addMarker({
                  color: "blue",
                  draggable: false,
                })
                .setLngLat([lng, lat])
                .addTo(mapInstance.current);

              markerRef.current = newMarker;

              onLocationSelect(lat, lng, formattedAddress);
            } else {
              console.error("No results found for the given search query.");
            }
          }
        }
      } catch (error) {
        console.error("Error fetching location data:", error);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleLocationSelect = async (lat: number, lng: number) => {
    setIsLoading(true);
    try {
      const [scoreData, reportData, storyData] = await Promise.all([calculateScore(lat, lng, userType), getLocationReports(lat, lng), getAreaStories(lat, lng)]);

      const mockAreaDetails = {
        hospitals: 5,
        parks: 9,
        police_stations: 0,
      };

      setScores(scoreData);
      setReports(reportData);
      setStories(storyData);
      setAreaDetails(mockAreaDetails);
      onLocationSelect(lat, lng, "");
    } catch (error) {
      console.error("Error fetching location data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="w-full h-[600px] rounded-lg overflow-hidden bg-white shadow-lg">
        <div className="p-4 border-b">
          <div className="flex space-x-2">
            <Input type="text" placeholder="Search for a location" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleKeyPress} className="flex-1" />
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
        <div className="relative h-[calc(100%-73px)]">
          <div ref={mapRef} className="w-full h-full" />
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeletons />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-8">
            {scores && areaDetails && <ParameterDisplay scores={scores} areaDetails={areaDetails} />}
            {reports && <LocationReports reports={reports.reports} />}
          </div>
          <div>{stories && <AreaStories stories={stories.stories} />}</div>
        </div>
      )}
    </div>
  );
};

const LoadingSkeletons = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-40" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4 py-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="text-center space-y-2">
                  <Skeleton className="h-8 w-12 mx-auto" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-8 w-24 mx-auto" />
            </div>
            <div className="flex justify-between gap-4 pt-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-10 flex-1" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default React.memo(Map);
