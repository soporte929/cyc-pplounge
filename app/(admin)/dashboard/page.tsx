import { getDashboardMetrics } from "./metrics";

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();

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
      </div>
    </main>
  );
}
