import { Logger } from "src/logger";

interface Point {
  x: number;
  y: number;
}

function createLinearApproximation(points: Point[]) {
  if (points.length < 2) {
    Logger.error("Для линейной аппроксимации необходимо минимум 2 точки");
    return;
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  let sumYY = 0;
  const n = points.length;

  for (const point of points) {
    sumX += point.x;
    sumY += point.y;
    sumXY += point.x * point.y;
    sumXX += point.x * point.x;
    sumYY += point.y * point.y;
  }

  const a = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const b = (sumY - a * sumX) / n;

  const meanY = sumY / n;
  let totalVariation = 0;
  let explainedVariation = 0;

  for (const point of points) {
    const predictedY = a * point.x + b;
    totalVariation += Math.pow(point.y - meanY, 2);
    explainedVariation += Math.pow(predictedY - meanY, 2);
  }

  const r2 = explainedVariation / totalVariation;

  const approximationFunction = (x: number): number => {
    return a * x + b;
  };

  return {
    calculate: approximationFunction,

    coefficients: { a: parseFloat(a.toFixed(4)), b: parseFloat(b.toFixed(4)) },

    r2,
  };
}

export { createLinearApproximation };
