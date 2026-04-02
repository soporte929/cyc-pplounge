import { createAnonClient } from "@/lib/supabase/server";
import { LoyaltyCard } from "@/components/loyalty-card";

interface CardPageProps {
  params: Promise<{ cardId: string }>;
}

export default async function CardPage({ params }: CardPageProps) {
  const { cardId } = await params;

  const supabase = await createAnonClient();

  const { data: card } = await supabase
    .from("loyalty_cards")
    .select(
      `
      id,
      stamps_current,
      is_active,
      customers ( name ),
      rewards ( name, stamps_required )
    `
    )
    .eq("id", cardId)
    .single();

  // Card not found
  if (!card) {
    return (
      <div className="min-h-screen bg-[#131313] text-[#e5e2e1] flex flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4">
          <div className="text-center space-y-3">
            <span className="material-symbols-outlined text-[#99907e] text-5xl block">
              credit_card_off
            </span>
            <p className="font-headline font-bold text-xl uppercase tracking-tight">
              Tarjeta no encontrada
            </p>
            <p className="text-[11px] uppercase tracking-widest text-on-surface-variant">
              Verifica el enlace e intenta de nuevo
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Card inactive
  if (!card.is_active) {
    return (
      <div className="min-h-screen bg-[#131313] text-[#e5e2e1] flex flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4">
          <div className="text-center space-y-3">
            <span className="material-symbols-outlined text-[#99907e] text-5xl block">
              block
            </span>
            <p className="font-headline font-bold text-xl uppercase tracking-tight">
              Tarjeta desactivada
            </p>
            <p className="text-[11px] uppercase tracking-widest text-on-surface-variant">
              Contacta al personal del local para más información
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Supabase returns joined relations as arrays when using select with foreign keys
  const customer = Array.isArray(card.customers)
    ? card.customers[0]
    : card.customers;
  const reward = Array.isArray(card.rewards) ? card.rewards[0] : card.rewards;

  const fullName = (customer as { name?: string } | null)?.name ?? "Member";
  const firstName = fullName.split(" ")[0];

  const stampsCurrent = card.stamps_current ?? 0;
  const stampsRequired =
    (reward as { stamps_required?: number } | null)?.stamps_required ?? 10;
  const rewardName =
    (reward as { name?: string } | null)?.name ?? null;
  const rewardAvailable = stampsCurrent >= stampsRequired;

  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1]">
      <Header />

      <main className="pt-16">
        <div className="max-w-md mx-auto px-4 py-8">
          {/* Welcome header */}
          <div className="mb-6">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
              Miembro
            </p>
            <h1 className="font-headline font-extrabold text-3xl uppercase tracking-tighter leading-none">
              {firstName}
            </h1>
          </div>

          <LoyaltyCard
            customerName={fullName}
            stampsCurrent={stampsCurrent}
            stampsRequired={stampsRequired}
            rewardName={rewardName}
            rewardAvailable={rewardAvailable}
            cardId={card.id}
          />
        </div>
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#0e0e0e] border-b border-[#e6c364]/10 shadow-[0_4px_40px_rgba(230,195,100,0.04)] flex items-center justify-center">
      <span className="font-headline font-black text-[#e6c364] uppercase tracking-widest text-sm animate-logo-breathe">
        PHI PHI LOUNGE
      </span>
    </header>
  );
}
