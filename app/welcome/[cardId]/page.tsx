import Link from "next/link";
import { createAnonClient } from "@/lib/supabase/server";

interface WelcomePageProps {
  params: Promise<{ cardId: string }>;
}

export default async function WelcomePage({ params }: WelcomePageProps) {
  const { cardId } = await params;

  const supabase = await createAnonClient();

  const { data: card } = await supabase
    .from("loyalty_cards")
    .select(`id, customers ( name )`)
    .eq("id", cardId)
    .single();

  const customer = Array.isArray(card?.customers)
    ? card.customers[0]
    : card?.customers;

  const fullName = (customer as { name?: string } | null)?.name ?? "Member";
  const firstName = fullName.split(" ")[0].toUpperCase();

  const steps = [
    {
      icon: "qr_code_scanner",
      title: "Muestra tu QR",
      description: "Enseña tu QR al staff cada vez que pidas una shisha",
    },
    {
      icon: "spa",
      title: "Acumula sellos",
      description: "Ganas un sello con cada visita",
    },
    {
      icon: "redeem",
      title: "Disfruta tu premio",
      description: "Al llegar a 10 sellos, ¡tu shisha es gratis!",
    },
  ];

  return (
    <div className="dark min-h-screen bg-[#131313] text-[#e5e2e1]">
      {/* Top App Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#0e0e0e] border-b border-[#e6c364]/10 shadow-[0_4px_40px_rgba(230,195,100,0.04)] flex items-center justify-center">
        <span className="font-headline font-black text-[#e6c364] uppercase tracking-widest text-sm animate-logo-breathe">
          PHI PHI LOUNGE
        </span>
      </header>

      {/* Main content */}
      <main className="flex min-h-screen items-center justify-center px-4 pt-16">
        <div className="w-full max-w-md py-12 animate-fade-in-up">

          {/* Checkmark */}
          <div className="flex justify-center mb-6 animate-bounce-in">
            <div className="w-20 h-20 rounded-full bg-green-500/15 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-green-400 text-5xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
            </div>
          </div>

          {/* Headline */}
          <div className="text-center mb-8">
            <h1 className="font-headline font-extrabold text-4xl tracking-tighter uppercase leading-none mb-3">
              ¡BIENVENIDO,<br />{firstName}!
            </h1>
            <p className="text-[#e6c364] text-xs uppercase tracking-widest">
              Tu tarjeta de fidelización está activa
            </p>
          </div>

          {/* Step cards */}
          <div className="space-y-3 mb-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="bg-[#1c1b1b] rounded-xl p-4 flex items-center gap-4 animate-fade-in-up"
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                <div className="w-10 h-10 rounded-lg bg-[#353534] flex items-center justify-center flex-shrink-0">
                  <span
                    className="material-symbols-outlined text-[#e6c364] text-xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {step.icon}
                  </span>
                </div>
                <div>
                  <p className="font-headline font-bold text-sm uppercase tracking-tight text-[#e5e2e1] leading-none mb-1">
                    {step.title}
                  </p>
                  <p className="text-[11px] text-[#d0c5b2] leading-relaxed">
                    {step.description}
                  </p>
                </div>
                <div className="ml-auto flex-shrink-0">
                  <span className="text-[10px] font-headline font-black text-[#e6c364]/60 uppercase tracking-widest">
                    {index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link
            href={`/card/${cardId}`}
            className="block w-full bg-[#e6c364] text-[#3d2e00] font-headline font-bold uppercase tracking-widest py-5 rounded-md text-center transition-opacity hover:opacity-90 btn-press animate-fade-in-up"
            style={{ animationDelay: "0.45s" }}
          >
            Ver mi tarjeta
          </Link>
        </div>
      </main>
    </div>
  );
}
