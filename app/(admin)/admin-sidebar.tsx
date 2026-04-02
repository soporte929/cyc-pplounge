"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", icon: "dashboard", label: "Dashboard" },
  { href: "/customers", icon: "group", label: "Clientes" },
  { href: "/rewards", icon: "stars", label: "Rewards" },
  { href: "/staff", icon: "badge", label: "Staff" },
  { href: "/config", icon: "settings", label: "Ajustes" },
];

export function AdminSidebar({ staffName }: { staffName: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-72 bg-[#0e0e0e] flex-col py-8 z-50 border-r border-[#4d4637]/10">
      {/* Brand */}
      <div className="px-8 mb-12">
        <span className="text-[#e6c364] font-headline font-black tracking-widest text-xl uppercase">
          PHI PHI LOUNGE
        </span>
        <p className="text-[10px] text-[#d0c5b2] tracking-[0.2em] mt-1 font-bold uppercase opacity-60">
          Panel Admin
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                isActive
                  ? "flex items-center gap-4 bg-[#e6c364]/10 text-[#e6c364] border-l-4 border-[#e6c364] px-8 py-4 transition-all duration-300"
                  : "flex items-center gap-4 text-[#d0c5b2] px-8 py-4 opacity-80 hover:bg-white/5 hover:opacity-100 transition-all group"
              }
            >
              <span
                className={`material-symbols-outlined text-xl ${
                  !isActive ? "group-hover:text-[#e6c364] transition-colors" : ""
                }`}
              >
                {item.icon}
              </span>
              <span className="font-headline font-semibold tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Admin info */}
      <div className="px-8 mt-auto pt-8 border-t border-[#4d4637]/10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#353534] flex items-center justify-center border border-[#4d4637]/20">
            <span className="text-[#e6c364] text-xs font-bold">
              {staffName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-[#e5e2e1] uppercase tracking-tighter">
              {staffName}
            </p>
            <p className="text-[10px] text-[#d0c5b2] font-medium">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
