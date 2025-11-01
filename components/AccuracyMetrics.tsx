"use client";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Target,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";

interface MetricData {
  label: string;
  current: number;
  target: number;
  unit: string;
  icon: React.ReactNode;
}

interface AccuracyMetricsProps {
  metrics?: {
    kneeAngle?: { angle: number; visibility: number };
    elbowAngle?: { angle: number; visibility: number };
    backAngle?: { angle: number; visibility: number };
    hipAngle?: { angle: number; visibility: number };
    shoulderAngle?: { angle: number; visibility: number };
    overallAccuracy: number;
    repsCompleted?: number;
    targetReps?: number;
  };
  isVisible: boolean;
}

export default function AccuracyMetrics({
  metrics,
  isVisible,
}: AccuracyMetricsProps) {
  if (!isVisible || !metrics) return null;

  const getStatusIcon = (accuracy: number) => {
    if (accuracy >= 90)
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (accuracy >= 70)
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusColor = (accuracy: number) => {
    if (accuracy >= 90) return "text-green-600";
    if (accuracy >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (accuracy: number) => {
    if (accuracy >= 90) return "bg-green-500";
    if (accuracy >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  const metricData: MetricData[] = [
    {
      label: "Knee Angle",
      current: metrics.kneeAngle?.angle || 0,
      target: 90,
      unit: "°",
      icon: <Activity className="h-4 w-4" />,
    },
    {
      label: "Elbow Angle",
      current: metrics.elbowAngle?.angle || 0,
      target: 180,
      unit: "°",
      icon: <Activity className="h-4 w-4" />,
    },
    {
      label: "Back Position",
      current: metrics.backAngle?.angle || 0,
      target: 180,
      unit: "°",
      icon: <Activity className="h-4 w-4" />,
    },
    {
      label: "Hip Angle",
      current: metrics.hipAngle?.angle || 0,
      target: 90,
      unit: "°",
      icon: <Activity className="h-4 w-4" />,
    },
  ];

  const calculateMetricAccuracy = (current: number, target: number): number => {
    const difference = Math.abs(current - target);
    const maxDifference = target * 0.5; // Allow 50% deviation
    const accuracy = Math.max(0, 100 - (difference / maxDifference) * 100);
    return Math.round(accuracy);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Real-time Metrics
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(metrics.overallAccuracy)}
            <Badge
              variant="outline"
              className={getStatusColor(metrics.overallAccuracy)}
            >
              {metrics.overallAccuracy}% Accuracy
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Accuracy Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Score</span>
            <span className={getStatusColor(metrics.overallAccuracy)}>
              {metrics.overallAccuracy}%
            </span>
          </div>
          <Progress value={metrics.overallAccuracy} className="h-3" />
        </div>

        {/* Individual Metrics */}
        <div className="grid grid-cols-2 gap-3">
          {metricData.map((metric, index) => {
            const accuracy = calculateMetricAccuracy(
              metric.current,
              metric.target
            );
            const isGood = accuracy >= 90;
            const isFair = accuracy >= 70;

            return (
              <Alert key={index} className="p-3">
                <div className="flex items-start gap-2">
                  {metric.icon}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">
                        {metric.label}
                      </span>
                      <div className="flex items-center gap-1">
                        {accuracy >= 90 ? (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        ) : accuracy < 70 ? (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        ) : null}
                      </div>
                    </div>
                    <AlertDescription className="flex items-center justify-between">
                      <span
                        className={`font-bold ${
                          isGood
                            ? "text-green-600"
                            : isFair
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {metric.current}
                        {metric.unit}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Target: {metric.target}
                        {metric.unit}
                      </span>
                    </AlertDescription>
                    <Progress value={accuracy} className="h-1 mt-2" />
                  </div>
                </div>
              </Alert>
            );
          })}
        </div>

        {/* Rep Counter */}
        {metrics.repsCompleted !== undefined && metrics.targetReps && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="text-sm font-medium">Repetitions</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">
                {metrics.repsCompleted} / {metrics.targetReps}
              </span>
              <Badge
                variant={
                  metrics.repsCompleted >= metrics.targetReps
                    ? "default"
                    : "secondary"
                }
              >
                {metrics.repsCompleted >= metrics.targetReps
                  ? "Complete!"
                  : `${metrics.targetReps - metrics.repsCompleted} left`}
              </Badge>
            </div>
          </div>
        )}

        {/* Feedback Message */}
        {metrics.overallAccuracy >= 90 && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Excellent form! Keep it up!
            </AlertDescription>
          </Alert>
        )}

        {metrics.overallAccuracy >= 70 && metrics.overallAccuracy < 90 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Good form, but there's room for improvement. Pay attention to the
              highlighted metrics.
            </AlertDescription>
          </Alert>
        )}

        {metrics.overallAccuracy < 70 && (
          <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Form needs adjustment. Watch the demonstration and try to align
              your position more closely.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
