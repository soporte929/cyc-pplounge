"use client";

import { useRef, useTransition } from "react";

type Props = {
  onSubmit: (data: FormData) => Promise<void>;
  onClose: () => void;
};

export function InviteStaffForm({ onSubmit, onClose }: Props) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    startTransition(async () => {
      await onSubmit(fd);
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-[70] flex flex-col lg:flex-row lg:justify-end">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer — full-screen on mobile, side panel on lg+ */}
      <div className="relative z-10 w-full lg:max-w-lg h-full bg-[#0e0e0e] lg:border-l border-[#e6c364]/10 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-[#4d4637]/10 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-headline font-extrabold uppercase tracking-tighter text-[#e5e2e1]">
              Crear Staff
            </h2>
            <p className="mt-0.5 text-xs text-[#d0c5b2]">
              Crea una cuenta de acceso para el nuevo miembro del equipo.
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-[#d0c5b2]">close</span>
          </button>
        </div>

        {/* Form — scrollable area */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
        >
          {/* Name */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-[#d0c5b2] font-bold">
              Nombre completo
            </label>
            <input
              name="name"
              type="text"
              required
              placeholder="e.g. Maria Santos"
              className="w-full bg-[#1c1b1b] border-0 rounded-xl px-5 py-4 text-sm text-[#e5e2e1] placeholder:text-[#d0c5b2]/40 focus:outline-none focus:ring-1 focus:ring-[#e6c364]/40 focus:bg-[#353534] transition-all"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-[#d0c5b2] font-bold">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="staff@phiphilounge.com"
              className="w-full bg-[#1c1b1b] border-0 rounded-xl px-5 py-4 text-sm text-[#e5e2e1] placeholder:text-[#d0c5b2]/40 focus:outline-none focus:ring-1 focus:ring-[#e6c364]/40 focus:bg-[#353534] transition-all"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-[#d0c5b2] font-bold">
              Contraseña
            </label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
              className="w-full bg-[#1c1b1b] border-0 rounded-xl px-5 py-4 text-sm text-[#e5e2e1] placeholder:text-[#d0c5b2]/40 focus:outline-none focus:ring-1 focus:ring-[#e6c364]/40 focus:bg-[#353534] transition-all"
            />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-[#d0c5b2] font-bold">
              Rol
            </label>
            <select
              name="role"
              defaultValue="staff"
              className="w-full bg-[#1c1b1b] border-0 rounded-xl px-5 py-4 text-sm text-[#e5e2e1] focus:outline-none focus:ring-1 focus:ring-[#e6c364]/40 focus:bg-[#353534] transition-all appearance-none cursor-pointer"
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </form>

        {/* Actions — fixed at bottom of drawer */}
        <div className="flex-shrink-0 px-6 py-4 pb-28 lg:pb-6 border-t border-[#4d4637]/10 bg-[#0e0e0e]">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="py-3.5 rounded-xl bg-[#1c1b1b] text-[10px] font-bold uppercase tracking-widest text-[#d0c5b2] hover:bg-[#353534] transition-colors"
            >
              Descartar
            </button>
            <button
              type="button"
              onClick={() => formRef.current?.requestSubmit()}
              disabled={isPending}
              className="py-3.5 rounded-xl bg-[#e6c364] text-[#3d2e00] text-[10px] font-bold uppercase tracking-widest hover:bg-[#c9a84c] transition-colors disabled:opacity-60 btn-press"
            >
              {isPending ? "Creando..." : "Crear cuenta"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
