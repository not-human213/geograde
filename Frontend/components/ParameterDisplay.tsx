import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ParameterDisplayProps {
  scores: {
    total_score: number;
    parameter_scores: {
      [key: string]: number;
    };
  };
  areaDetails: {
    hospitals: number;
    parks: number;
    police_stations: number;
  };
}

export function ParameterDisplay({ scores, areaDetails }: ParameterDisplayProps) {
  const [showAllParameters, setShowAllParameters] = useState(false);

  const formatParameterName = (name: string) => {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const mainParameters = ["hospitals", "schools", "public_transport"];
  const allParameters = [
    "hospitals",
    "schools",
    "public_transport",
    "recreational",
    "commercial",
    "job_hubs",
    "amenities",
    "worship",
    "market",
    "forest_cover",
    "crime_rate",
    "gdp",
    "hdi",
    "user_reports",
  ];

  const displayParameters = showAllParameters ? allParameters : mainParameters;

  return (
    <Card className="w-full">
      <CardHeader>
        <h2 className="text-2xl font-bold">Area</h2>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Parameters Grid */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {displayParameters.map((param) => (
              <div key={param}>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{formatParameterName(param)}</span>
                  <span>{scores.parameter_scores[param]?.toFixed(1)}%</span>
                </div>
                <Progress value={scores.parameter_scores[param]} className="h-2" />
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full" onClick={() => setShowAllParameters(!showAllParameters)}>
            {showAllParameters ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" /> Show Less Parameters
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" /> Show More Parameters
              </>
            )}
          </Button>
        </div>

        {/* Facility Count Display */}
        <div className="grid grid-cols-3 gap-4 py-6 border-t border-b">
          <div className="text-center">
            <div className="text-3xl font-bold">{areaDetails.hospitals}</div>
            <div className="text-sm text-gray-600">Hospitals</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{areaDetails.parks}</div>
            <div className="text-sm text-gray-600">Parks</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{areaDetails.police_stations}</div>
            <div className="text-sm text-gray-600">Police Stations</div>
          </div>
        </div>

        {/* Livability Score */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Livability Score</h3>
          <Progress value={scores.total_score} className="h-3" />
          <div className="text-center text-2xl font-bold">{scores.total_score.toFixed(1)}/100</div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between gap-4 pt-4">
          <Button variant="default" className="flex-1">
            Home
          </Button>
          <Button variant="secondary" className="flex-1">
            Detail Report
          </Button>
          <Button variant="default" className="flex-1 bg-green-500 hover:bg-green-600">
            Compare
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
