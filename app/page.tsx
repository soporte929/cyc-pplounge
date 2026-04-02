import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#131313] flex flex-col">
      {/* Fixed Header */}
      <header className="fixed top-0 inset-x-0 z-50 h-16 bg-[#0e0e0e] border-b border-[#e6c364]/10 flex items-center justify-center">
        <span className="font-headline font-black text-[#e6c364] text-sm tracking-[0.2em] uppercase animate-logo-breathe">
          PHI PHI LOUNGE
        </span>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center pt-16">
        <div className="w-full max-w-md px-5 flex flex-col gap-10 py-12">

          {/* Hero */}
          <section className="flex flex-col items-center text-center gap-5 animate-fade-in-up">
            <div className="animate-scale-in">
              <Image
                src="/shisha.png"
                alt="Shisha"
                width={80}
                height={80}
                priority
                className="w-20 h-20 object-contain"
              />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="font-headline font-extrabold text-3xl uppercase tracking-tighter text-[#e5e2e1] leading-tight">
                Tu fidelidad<br />tiene premio
              </h1>
              <p className="text-sm text-[#d0c5b2] leading-relaxed max-w-xs mx-auto">
                Acumula sellos cada vez que nos visitas. Al llegar a 10, tu shisha es gratis.
              </p>
            </div>
          </section>

          {/* How it works */}
          <section className="flex flex-col gap-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#99907e] font-headline font-bold">
              Cómo funciona
            </p>
            <ol className="flex flex-col gap-3 stagger-children">
              {/* Step 1 */}
              <li className="bg-[#1c1b1b] rounded-xl p-5 flex flex-row items-center gap-4">
                <div className="relative shrink-0">
                  <div className="bg-[#353534] rounded-lg p-2.5">
                    <span className="material-symbols-outlined text-[#e6c364] text-xl">nfc</span>
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#e6c364] text-[#3d2e00] text-[9px] font-headline font-black flex items-center justify-center leading-none">
                    1
                  </span>
                </div>
                <span className="text-sm text-[#e5e2e1] font-body">
                  Escanea el QR de la mesa
                </span>
              </li>

              {/* Step 2 */}
              <li className="bg-[#1c1b1b] rounded-xl p-5 flex flex-row items-center gap-4">
                <div className="relative shrink-0">
                  <div className="bg-[#353534] rounded-lg p-2.5">
                    <span className="material-symbols-outlined text-[#e6c364] text-xl">qr_code_scanner</span>
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#e6c364] text-[#3d2e00] text-[9px] font-headline font-black flex items-center justify-center leading-none">
                    2
                  </span>
                </div>
                <span className="text-sm text-[#e5e2e1] font-body">
                  El staff escanea tu tarjeta
                </span>
              </li>

              {/* Step 3 */}
              <li className="bg-[#1c1b1b] rounded-xl p-5 flex flex-row items-center gap-4">
                <div className="relative shrink-0">
                  <div className="bg-[#353534] rounded-lg p-2.5">
                    <span className="material-symbols-outlined text-[#e6c364] text-xl">redeem</span>
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#e6c364] text-[#3d2e00] text-[9px] font-headline font-black flex items-center justify-center leading-none">
                    3
                  </span>
                </div>
                <span className="text-sm text-[#e5e2e1] font-body">
                  ¡Consigue tu shisha gratis!
                </span>
              </li>
            </ol>
          </section>

          {/* CTA */}
          <section className="flex flex-col items-center gap-4 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <Link
              href="/register"
              className="block w-full bg-[#e6c364] text-[#3d2e00] font-headline font-bold uppercase tracking-widest py-5 rounded-md text-center text-sm btn-press"
            >
              Obtener mi tarjeta
            </Link>
          </section>

          {/* Footer */}
          <footer className="flex flex-col items-center gap-1 pt-2 pb-6">
            <span className="font-headline font-black text-[#99907e] text-[10px] tracking-[0.2em] uppercase">
              Phi Phi Lounge
            </span>
            <span className="text-[#4d4637] text-[10px] tracking-widest uppercase">
              Est. 2024
            </span>
            <Link
              href="/login"
              className="mt-4 text-[10px] uppercase tracking-widest text-[#99907e] hover:text-[#d0c5b2] transition-colors"
            >
              Acceso staff
            </Link>
          </footer>

        </div>
      </main>
    </div>
  );
}
