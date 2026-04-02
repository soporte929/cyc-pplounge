"use client";

import { useState, useTransition } from "react";

type Config = {
  business_name: string;
  logo_url: string | null;
  primary_color: string | null;
  welcome_message: string | null;
  pass_strip_message: string | null;
};

type Props = {
  initial: Config;
  saveConfig: (data: FormData) => Promise<void>;
};

export function ConfigForm({ initial, saveConfig }: Props) {
  const [isPending, startTransition] = useTransition();
  const [color, setColor] = useState(initial.primary_color ?? "#e6c364");
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await saveConfig(fd);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Business Name */}
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-widest text-[#d0c5b2] font-bold">
          Nombre del negocio
        </label>
        <input
          name="business_name"
          type="text"
          defaultValue={initial.business_name}
          required
          placeholder="Phi Phi Lounge"
          className="w-full bg-[#1c1b1b] border-0 rounded-xl px-5 py-4 text-sm text-[#e5e2e1] placeholder:text-[#d0c5b2]/40 focus:outline-none focus:ring-1 focus:ring-[#e6c364]/40 focus:bg-[#353534] transition-all"
        />
      </div>

      {/* Logo URL */}
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-widest text-[#d0c5b2] font-bold">
          URL del logo
        </label>
        <input
          name="logo_url"
          type="text"
          defaultValue={initial.logo_url ?? ""}
          placeholder="https://..."
          className="w-full bg-[#1c1b1b] border-0 rounded-xl px-5 py-4 text-sm text-[#e5e2e1] placeholder:text-[#d0c5b2]/40 focus:outline-none focus:ring-1 focus:ring-[#e6c364]/40 focus:bg-[#353534] transition-all"
        />
      </div>

      {/* Primary Color */}
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-widest text-[#d0c5b2] font-bold">
          Color principal
        </label>
        <div className="flex items-center gap-3">
          {/* Text input */}
          <input
            name="primary_color"
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="#e6c364"
            className="flex-1 bg-[#1c1b1b] border-0 rounded-xl px-5 py-4 text-sm text-[#e5e2e1] placeholder:text-[#d0c5b2]/40 focus:outline-none focus:ring-1 focus:ring-[#e6c364]/40 focus:bg-[#353534] transition-all font-mono"
          />
          {/* Color preview swatch */}
          <div className="relative flex-shrink-0">
            <div
              className="w-14 h-14 rounded-xl border border-white/10 cursor-pointer overflow-hidden"
              style={{ backgroundColor: color }}
            >
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                aria-label="Pick color"
              />
            </div>
          </div>
        </div>
        <p className="text-[10px] text-[#d0c5b2]/60 tracking-wide">
          Se usa en sellos, insignias y elementos destacados de las tarjetas de cliente.
        </p>
      </div>

      {/* Welcome Message */}
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-widest text-[#d0c5b2] font-bold">
          Mensaje de bienvenida
        </label>
        <textarea
          name="welcome_message"
          rows={3}
          defaultValue={initial.welcome_message ?? ""}
          placeholder="¡Bienvenido a Phi Phi Lounge! Acumula sellos y gana recompensas exclusivas."
          className="w-full bg-[#1c1b1b] border-0 rounded-xl px-5 py-4 text-sm text-[#e5e2e1] placeholder:text-[#d0c5b2]/40 focus:outline-none focus:ring-1 focus:ring-[#e6c364]/40 focus:bg-[#353534] transition-all resize-none"
        />
        <p className="text-[10px] text-[#d0c5b2]/60 tracking-wide">
          Se muestra en la tarjeta de fidelidad del cliente tras el registro.
        </p>
      </div>

      {/* Pass Strip Message */}
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-widest text-[#d0c5b2] font-bold">
          Mensaje de la tira del pase
        </label>
        <textarea
          name="pass_strip_message"
          rows={2}
          defaultValue={initial.pass_strip_message ?? ""}
          placeholder="Muestra este pase para conseguir tu sello."
          className="w-full bg-[#1c1b1b] border-0 rounded-xl px-5 py-4 text-sm text-[#e5e2e1] placeholder:text-[#d0c5b2]/40 focus:outline-none focus:ring-1 focus:ring-[#e6c364]/40 focus:bg-[#353534] transition-all resize-none"
        />
        <p className="text-[10px] text-[#d0c5b2]/60 tracking-wide">
          Texto corto que aparece en la tira del Apple Wallet / Google Wallet.
        </p>
      </div>

      {/* Save button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-5 rounded-xl bg-[#e6c364] text-[#3d2e00] font-headline font-bold uppercase tracking-widest text-sm hover:bg-[#c9a84c] transition-colors disabled:opacity-60"
        >
          {isPending ? "Guardando..." : saved ? "¡Guardado!" : "Guardar ajustes"}
        </button>
      </div>
    </form>
  );
}
