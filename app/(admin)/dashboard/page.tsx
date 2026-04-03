import Link from "next/link";
import { getDashboardMetrics, getStampsPerDay, getRecentActivity } from "./metrics";
import { ActivityChart } from "@/components/activity-chart";

function timeAgo(isoString: string): string {
  const date = new Date(isoString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "hace un momento";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "ayer";
  if (days < 7) return `hace ${days} días`;
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
}

export default async function DashboardPage() {
  const [metrics, stampsPerDay, recentActivity] = await Promise.all([
    getDashboardMetrics(),
    getStampsPerDay(),
    getRecentActivity(),
  ]);

  const mainCards = [
    {
      icon: "person_add",
      label: "Clientes totales",
      value: metrics.totalCustomers.toLocaleString(),
    },
    {
      icon: "confirmation_number",
      label: "Sellos hoy",
      value: metrics.stampsToday.toLocaleString(),
    },
    {
      icon: "redeem",
      label: "Rewards canjeados",
      value: metrics.rewardsRedeemed.toLocaleString(),
    },
    {
      icon: "analytics",
      label: "Activos este mes",
      value: metrics.activeCustomers.toLocaleString(),
    },
  ];

  const secondaryCards = [
    {
      icon: "conversion_path",
      label: "Tasa de conversión",
      value: `${metrics.conversionRate}%`,
    },
    {
      icon: "schedule",
      label: "Tiempo medio de ciclo",
      value: `${metrics.avgCycleTime}d`,
    },
    {
      icon: "person_off",
      label: "Clientes inactivos",
      value: metrics.inactiveCustomers.toLocaleString(),
    },
  ];

  return (
    <main className="flex-1 overflow-y-auto p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="animate-fade-in-up">
          <h1 className="text-4xl font-headline font-extrabold uppercase tracking-tighter text-[#e5e2e1]">
            Resumen
          </h1>
          <p className="mt-1 text-sm text-[#d0c5b2]">
            Métricas en tiempo real de Phi Phi Lounge
          </p>
        </div>

        {/* Row 1 — 4 main metric cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          {mainCards.map((card) => (
            <div
              key={card.label}
              className="bg-[#1a1a1a] p-8 rounded-xl border-l-4 border-[#e6c364] shadow-[0_4px_40px_rgba(230,195,100,0.02)] hover-glow animate-fade-in-up"
            >
              <span className="material-symbols-outlined text-[#c9a84c] text-3xl leading-none">
                {card.icon}
              </span>
              <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#d0c5b2]">
                {card.label}
              </p>
              <p className="mt-1 text-4xl font-headline font-black tracking-tighter text-[#e5e2e1]">
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Row 2 — 3 secondary metric cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {secondaryCards.map((card) => (
            <div
              key={card.label}
              className="bg-[#1a1a1a] p-8 rounded-xl border-l-4 border-[#e6c364] shadow-[0_4px_40px_rgba(230,195,100,0.02)] hover-glow animate-fade-in-up"
            >
              <span className="material-symbols-outlined text-[#c9a84c] text-3xl leading-none">
                {card.icon}
              </span>
              <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#d0c5b2]">
                {card.label}
              </p>
              <p className="mt-1 text-4xl font-headline font-black tracking-tighter text-[#e5e2e1]">
                {card.value}
              </p>
            </div>
          ))}
        </div>
        {/* Activity chart */}
        <div className="animate-fade-in-up">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#d0c5b2] mb-3">
            Actividad semanal
          </h2>
          <ActivityChart data={stampsPerDay} />
        </div>

        {/* Recent activity log */}
        <div className="animate-fade-in-up">
          <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden">
            {/* Table header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#d0c5b2]">
                Actividad reciente
              </h2>
              <Link
                href="/customers"
                className="text-[11px] uppercase tracking-widest text-[#e6c364] hover:text-[#c9a84c] transition-colors"
              >
                Ver todo
              </Link>
            </div>

            {recentActivity.length === 0 ? (
              <p className="px-6 py-8 text-sm text-[#99907e] text-center">
                No hay actividad reciente.
              </p>
            ) : (
              <>
                {/* Column headers */}
                <div className="grid grid-cols-[1fr_2fr_auto] gap-4 px-6 py-2 border-b border-white/5">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-[#99907e]">Nombre</span>
                  <span className="text-[10px] uppercase tracking-[0.15em] text-[#99907e]">Acción</span>
                  <span className="text-[10px] uppercase tracking-[0.15em] text-[#99907e]">Fecha</span>
                </div>

                <ul>
                  {recentActivity.map((item, i) => (
                    <li
                      key={`${item.type}-${item.time}-${i}`}
                      className={`grid grid-cols-[1fr_2fr_auto] gap-4 items-center px-6 py-3 ${
                        i < recentActivity.length - 1 ? "border-b border-white/5" : ""
                      }`}
                    >
                      {/* Avatar + name */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#e6c364]/10 border border-[#e6c364]/20 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-[#e6c364]">
                            {item.name !== "—" ? initials(item.name) : "?"}
                          </span>
                        </div>
                        <span className="text-sm text-[#e5e2e1] truncate">{item.name}</span>
                      </div>

                      {/* Action */}
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            item.type === "stamp" ? "bg-[#e6c364]" : "bg-emerald-400"
                          }`}
                        />
                        <span className="text-sm text-[#d0c5b2] truncate">{item.detail}</span>
                      </div>

                      {/* Time */}
                      <span className="text-xs text-[#99907e] whitespace-nowrap">
                        {timeAgo(item.time)}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
