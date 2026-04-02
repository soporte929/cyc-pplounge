"use client";

import { useRef, useState, useTransition } from "react";

type RewardFormData = {
  id?: string;
  name: string;
  description: string;
  stamps_required: number;
  image_url?: string;
};

type Props = {
  initial?: RewardFormData;
  onSubmit: (data: FormData) => Promise<void>;
  onClose: () => void;
};

export function RewardForm({ initial, onSubmit, onClose }: Props) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer — full-screen on mobile, side panel on lg+ */}
      <div className="relative z-10 w-full lg:max-w-lg h-full bg-[#0e0e0e] lg:border-l border-[#e6c364]/10 flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-[#4d4637]/10">
          <h2 className="text-xl font-headline font-extrabold uppercase tracking-tighter text-[#e5e2e1]">
            {initial?.id ? "Editar Reward" : "Nuevo Reward"}
          </h2>
          <p className="mt-1 text-xs text-[#d0c5b2]">
            {initial?.id
              ? "Actualiza los detalles del reward."
              : "Crea un nuevo reward de fidelidad."}
          </p>
        </div>

        {/* Form */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-8 py-6 space-y-6"
        >
          {initial?.id && (
            <input type="hidden" name="id" value={initial.id} />
          )}

          {/* Name */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-[#d0c5b2] font-bold">
              Nombre del reward
            </label>
            <input
              name="name"
              type="text"
              defaultValue={initial?.name ?? ""}
              required
              placeholder="Ej. Shisha gratis"
              className="w-full bg-[#1c1b1b] border-0 rounded-xl px-5 py-4 text-sm text-[#e5e2e1] placeholder:text-[#d0c5b2]/40 focus:outline-none focus:ring-1 focus:ring-[#e6c364]/40 focus:bg-[#353534] transition-all"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-[#d0c5b2] font-bold">
              Descripción
            </label>
            <textarea
              name="description"
              rows={3}
              defaultValue={initial?.description ?? ""}
              placeholder="Breve descripción del reward..."
              className="w-full bg-[#1c1b1b] border-0 rounded-xl px-5 py-4 text-sm text-[#e5e2e1] placeholder:text-[#d0c5b2]/40 focus:outline-none focus:ring-1 focus:ring-[#e6c364]/40 focus:bg-[#353534] transition-all resize-none"
            />
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-[#d0c5b2] font-bold">
              URL de imagen
            </label>
            <input
              name="image_url"
              type="text"
              defaultValue={initial?.image_url ?? ""}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="w-full bg-[#1c1b1b] border-0 rounded-xl px-5 py-4 text-sm text-[#e5e2e1] placeholder:text-[#d0c5b2]/40 focus:outline-none focus:ring-1 focus:ring-[#e6c364]/40 focus:bg-[#353534] transition-all"
            />
          </div>

          {/* Stamps required */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-[#d0c5b2] font-bold">
              Sellos requeridos
            </label>
            <input
              name="stamps_required"
              type="number"
              min={1}
              max={50}
              defaultValue={initial?.stamps_required ?? 10}
              required
              className="w-full bg-[#1c1b1b] border-0 rounded-xl px-5 py-4 text-sm text-[#e5e2e1] focus:outline-none focus:ring-1 focus:ring-[#e6c364]/40 focus:bg-[#353534] transition-all"
            />
          </div>
        </form>

        {/* Actions — sticky at bottom with padding for mobile bottom nav */}
        <div className="px-8 py-6 pb-safe border-t border-[#4d4637]/10 pb-10 lg:pb-6">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="py-4 rounded-xl bg-[#1c1b1b] text-[10px] font-bold uppercase tracking-widest text-[#d0c5b2] hover:bg-[#353534] transition-colors"
            >
              Descartar
            </button>
            <button
              type="submit"
              form=""
              onClick={() => formRef.current?.requestSubmit()}
              disabled={isPending}
              className="py-4 rounded-xl bg-[#e6c364] text-[#3d2e00] text-[10px] font-bold uppercase tracking-widest hover:bg-[#c9a84c] transition-colors disabled:opacity-60"
            >
              {isPending ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
