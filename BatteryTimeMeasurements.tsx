import { useState } from "react";
import { linearRegression } from "simple-statistics";

const getMinutesUntilFivePercent = (measurements: Measurement[]): number => {
  if (measurements.length < 2) {
    return 0;
  }

  const data = measurements.map((m) => [m.minutesElapsed, m.percentage]);

  const { m, b } = linearRegression(data);

  const estimatedPercentage = (5 - b) / m;

  return Math.round(estimatedPercentage);
};
const getMinutesFromfullUntilFivePercent = (
  measurements: Measurement[],
): number => {
  if (measurements.length < 2) {
    return 0;
  }

  const data = measurements
    .slice(0, -1)
    .map((m, i) => [
      measurements[i + 1].minutesElapsed - m.minutesElapsed,
      m.percentage - measurements[i + 1].percentage,
    ]);

  const { m, b } = linearRegression(data);

  const estimatedPercentage = (100 - 5 - b) / m;

  return Math.round(estimatedPercentage);
};

type Measurement = {
  minutesElapsed: number;
  percentage: number;
};

const START_MINUTES_TODO = 13 * 60 + 10;

function parseMeasurements(input: string): Measurement[] {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "")
    .map((line) => {
      const [time, percentage = ""] = line.split(/\s+/);
      const match = percentage.match(/^(\d+)%?$/);
      if (match) {
        const [hours, minutes] = time
          .split(":")
          .map((part) => parseInt(part, 10));
        return {
          minutesElapsed: hours * 60 + minutes - START_MINUTES_TODO,
          percentage: parseInt(match[1], 10),
        };
      }
      return null;
    })
    .filter((measurement) => measurement !== null) as Measurement[];
}

const BatteryTimeMeasurements = () => {
  const [input, setInput] = useState(`
  13:10  86%
  13:30  75%
  13:43  68%
`);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMeasurements(parseMeasurements(e.target.value));

    setInput(e.target.value);
  };

  return (
    <div>
      <div>
        <textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Enter battery measurements"
          rows={10}
          cols={50}
        />
      </div>
      {
        <div
          style={{
            border: "2px solid green",
            padding: "10px",
            marginTop: "10px",
          }}
        >
          Estimated time remaining (to 5%):{" "}
          {Math.floor(getMinutesUntilFivePercent(measurements) / 60)} hours and{" "}
          {getMinutesUntilFivePercent(measurements) % 60} minutes
          <br />
          Estimated time from 100% to 5%:{" "}
          {Math.floor(
            getMinutesFromfullUntilFivePercent(measurements) / 60,
          )}{" "}
          hours and {getMinutesFromfullUntilFivePercent(measurements) % 60}{" "}
          minutes
          <br />
        </div>
      }
    </div>
  );
};

export default BatteryTimeMeasurements;
