"use client";

import { useTransition } from "react";

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

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await onSubmit(formData);
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

      {/* Drawer */}
      <div className="relative z-10 w-full lg:max-w-lg h-full bg-[#0e0e0e] lg:border-l border-[#e6c364]/10 flex flex-col overflow-hidden" style={{ animation: "slide-in-right 0.3s ease-out" }}>
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-[#4d4637]/10 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-headline font-extrabold uppercase tracking-tighter text-[#e5e2e1]">
              {initial?.id ? "Editar Reward" : "Nuevo Reward"}
            </h2>
            <p className="mt-0.5 text-xs text-[#d0c5b2]">
              {initial?.id
                ? "Actualiza los detalles del reward."
                : "Crea un nuevo reward de fidelidad."}
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-[#d0c5b2]">close</span>
          </button>
        </div>

        {/* Form wraps everything including buttons */}
        <form action={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
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
                type="url"
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
          </div>

          {/* Actions inside the form */}
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
                type="submit"
                disabled={isPending}
                className="py-3.5 rounded-xl bg-[#e6c364] text-[#3d2e00] text-[10px] font-bold uppercase tracking-widest hover:bg-[#c9a84c] transition-colors disabled:opacity-60 btn-press"
              >
                {isPending ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
