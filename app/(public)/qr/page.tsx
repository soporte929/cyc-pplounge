import Image from "next/image";

export default function QRPrintPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8 print:p-0">
      {/* Printable card */}
      <div className="w-[350px] bg-[#131313] rounded-3xl p-8 flex flex-col items-center gap-6 shadow-2xl print:shadow-none">
        {/* Brand */}
        <div className="text-center">
          <p className="text-[#e6c364] font-headline font-black text-xl uppercase tracking-widest">
            PHI PHI LOUNGE
          </p>
          <p className="text-[#d0c5b2] text-[10px] uppercase tracking-[0.3em] mt-1">
            Programa de fidelización
          </p>
        </div>

        {/* Shisha icon */}
        <Image
          src="/shisha.png"
          alt="Shisha"
          width={48}
          height={48}
          className="w-12 h-12 object-contain"
        />

        {/* QR */}
        <div className="bg-white rounded-2xl p-4">
          <Image
            src="/qr-register.png"
            alt="QR de registro"
            width={200}
            height={200}
            className="w-[200px] h-[200px]"
          />
        </div>

        {/* Instructions */}
        <div className="text-center space-y-2">
          <p className="text-[#e5e2e1] font-headline font-bold text-sm uppercase tracking-wider">
            Escanea y consigue tu tarjeta
          </p>
          <p className="text-[#d0c5b2] text-xs leading-relaxed">
            Acumula 10 sellos y llévate<br />
            una shisha gratis
          </p>
        </div>

        {/* Decorative line */}
        <div className="w-16 h-0.5 bg-[#e6c364]/30 rounded-full" />
      </div>

      {/* Print button — hidden when printing */}
      <div className="fixed bottom-8 right-8 print:hidden">
        <button
          onClick={() => window.print()}
          className="bg-[#131313] text-[#e6c364] px-6 py-3 rounded-xl font-headline font-bold text-sm uppercase tracking-widest hover:bg-[#1c1b1b] transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">print</span>
          Imprimir
        </button>
      </div>
    </div>
  );
}
