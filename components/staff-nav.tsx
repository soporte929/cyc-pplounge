"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/scan", icon: "qr_code_scanner", label: "Escanear" },
  { href: "/rewards", icon: "stars", label: "Rewards" },
  { href: "/dashboard", icon: "dashboard", label: "Panel" },
  { href: "/staff", icon: "badge", label: "Staff" },
];

export function StaffNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-[#131313]/80 backdrop-blur-xl border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] rounded-t-3xl">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-90 ${
              isActive
                ? "text-[#e6c364] font-bold scale-110"
                : "text-[#d0c5b2] opacity-60 hover:opacity-100 hover:text-[#e6c364]"
            }`}
          >
            <span
              className="material-symbols-outlined text-xl"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {item.icon}
            </span>
            <span className="font-body font-medium text-[10px] uppercase tracking-widest mt-1">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
