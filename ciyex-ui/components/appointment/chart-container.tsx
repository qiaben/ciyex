import { getVitalSignData } from "@/utils/services/medical";
import BloodPressureChart from "./blood-pressure-chart";
import { HeartRateChart } from "./heart-rate-chart";
import { BarChart } from "lucide-react";

export default async function ChartContainer({ id }: { id: string }) {
  const { data, average, heartRateData, averageHeartRate } =
    await getVitalSignData(id.toString());

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 mb-2">
        <BarChart className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">Patient Vitals & Charts</h2>
      </div>
      <BloodPressureChart data={data} average={average} />
      <HeartRateChart data={heartRateData} average={averageHeartRate} />
    </div>
  );
}