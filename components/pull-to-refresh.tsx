"use client";
import { useRouter } from "next/navigation";
import { useState, useRef, useCallback } from "react";

export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pullDistance = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (startY.current === 0) return;
    pullDistance.current = e.touches[0].clientY - startY.current;
    if (pullDistance.current > 30) {
      setPulling(true);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (pullDistance.current > 80) {
      setRefreshing(true);
      router.refresh();
      setTimeout(() => {
        setRefreshing(false);
        setPulling(false);
      }, 1000);
    } else {
      setPulling(false);
    }
    startY.current = 0;
    pullDistance.current = 0;
  }, [router]);

  return (
    <div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      {(pulling || refreshing) && (
        <div className="flex justify-center py-4">
          <div className={`w-6 h-6 border-2 border-[#e6c364] border-t-transparent rounded-full ${refreshing ? "animate-spin" : ""}`} />
        </div>
      )}
      {children}
    </div>
  );
}
