import { Progress } from "@/components/ui/progress";

interface ScoreDisplayProps {
  scores: {
    total_score: number;
    parameter_scores: {
      [key: string]: number;
    };
  };
}

export function ScoreDisplay({ scores }: ScoreDisplayProps) {
  const formatParameterName = (name: string) => {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Total Score</h3>
        <span className="text-2xl font-bold">{scores.total_score.toFixed(1)}</span>
      </div>
      <div className="space-y-3">
        {Object.entries(scores.parameter_scores).map(([parameter, score]) => (
          <div key={parameter} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{formatParameterName(parameter)}</span>
              <span>{score.toFixed(1)}</span>
            </div>
            <Progress value={score} className="h-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
