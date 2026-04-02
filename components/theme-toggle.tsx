"use client";
import { useState } from "react";

export function ThemeToggle() {
  const [light, setLight] = useState(false);

  function toggle() {
    setLight(!light);
    document.getElementById("card-page")?.setAttribute("data-theme", light ? "dark" : "light");
  }

  return (
    <button onClick={toggle} className="p-2 rounded-full hover:bg-white/10 transition-colors">
      <span className="material-symbols-outlined text-lg">
        {light ? "dark_mode" : "light_mode"}
      </span>
    </button>
  );
}
