"use client";

interface DayData {
  date: string;
  count: number;
}

interface ActivityChartProps {
  data: DayData[];
}

export function ActivityChart({ data }: ActivityChartProps) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="bg-[#1a1a1a] rounded-xl p-6">
      <div className="flex items-end justify-between gap-2 h-32">
        {data.map((day, i) => {
          const heightPct = max > 0 ? (day.count / max) * 100 : 0;
          return (
            <div
              key={day.date}
              className="flex flex-col items-center flex-1 gap-1"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="text-[10px] text-[#d0c5b2] font-medium">
                {day.count > 0 ? day.count : ""}
              </span>
              <div className="w-full flex items-end" style={{ height: "80px" }}>
                <div
                  className="w-full bg-[#e6c364] rounded-sm animate-fade-in-up"
                  style={{
                    height: `${Math.max(heightPct, day.count > 0 ? 4 : 0)}%`,
                    animationDelay: `${i * 60}ms`,
                    animationFillMode: "backwards",
                  }}
                />
              </div>
              <span className="text-[10px] uppercase tracking-wider text-[#99907e] mt-1">
                {day.date}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
