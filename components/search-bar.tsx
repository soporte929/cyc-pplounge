"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useCallback } from "react";

export function SearchBar({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const timeoutRef = useRef<NodeJS.Timeout>(undefined);
  const currentSearch = searchParams.get("q") ?? "";

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (e.target.value) {
        params.set("q", e.target.value);
        params.delete("page"); // reset to page 1
      } else {
        params.delete("q");
      }
      router.push(`?${params.toString()}`);
    }, 300);
  }, [router, searchParams]);

  return (
    <div className="relative">
      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#99907e] text-lg">search</span>
      <input
        type="text"
        defaultValue={currentSearch}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full bg-[#1c1b1b] border-0 rounded-xl pl-12 pr-5 py-3 text-sm text-[#e5e2e1] placeholder:text-[#d0c5b2]/40 focus:outline-none focus:ring-1 focus:ring-[#e6c364]/40 focus:bg-[#353534] transition-all"
      />
    </div>
  );
}
