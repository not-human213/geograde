import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface LocationReportsProps {
  reports: Array<{
    ratings: {
      [key: string]: number;
    };
  }>;
}

export function LocationReports({ reports }: LocationReportsProps) {
  const [expanded, setExpanded] = useState(false);

  if (!reports.length) return null;

  const formatRatingName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const ratings = reports[0].ratings;
  const mainRatings = ["cleanliness", "safety", "greenery"];
  const otherRatings = Object.keys(ratings).filter((key) => !mainRatings.includes(key));

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Location Ratings</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main ratings */}
        <div className="grid grid-cols-3 gap-4">
          {mainRatings.map((rating) => (
            <div key={rating} className="text-center">
              <div className="text-2xl font-bold">{ratings[rating]}</div>
              <div className="text-sm text-gray-600">{formatRatingName(rating)}</div>
            </div>
          ))}
        </div>

        {/* Expandable other ratings */}
        {otherRatings.length > 0 && (
          <>
            <Button variant="ghost" className="w-full" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {expanded ? "Show Less" : "Show More"}
            </Button>

            {expanded && (
              <div className="grid grid-cols-2 gap-4">
                {otherRatings.map((rating) => (
                  <div key={rating} className="text-center">
                    <div className="text-xl font-bold">{ratings[rating]}</div>
                    <div className="text-sm text-gray-600">{formatRatingName(rating)}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
