import { verifyAdmin } from "@/lib/auth/verify-admin";
import { revalidatePath } from "next/cache";
import { ConfigForm } from "./config-form";
import { createServiceClient } from "@/lib/supabase/server";

async function saveConfig(formData: FormData) {
  "use server";
  const auth = await verifyAdmin();
  if (!auth.authorized) return;
  const supabase = auth.supabase;

  const business_name = formData.get("business_name") as string;
  const logo_url = (formData.get("logo_url") as string) || null;
  const primary_color = (formData.get("primary_color") as string) || "#e6c364";
  const welcome_message = (formData.get("welcome_message") as string) || null;
  const pass_strip_message =
    (formData.get("pass_strip_message") as string) || null;

  // Singleton row — fetch existing id to upsert
  const { data: existing } = await supabase
    .from("business_config")
    .select("id")
    .limit(1)
    .single();

  if (existing?.id) {
    await supabase
      .from("business_config")
      .update({
        business_name,
        logo_url,
        primary_color,
        welcome_message,
        pass_strip_message,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("business_config").insert({
      business_name,
      logo_url,
      primary_color,
      welcome_message,
      pass_strip_message,
    });
  }

  revalidatePath("/config");
}

export default async function ConfigPage() {
  const supabase = await createServiceClient();

  const { data: config } = await supabase
    .from("business_config")
    .select(
      "business_name, logo_url, primary_color, welcome_message, pass_strip_message"
    )
    .limit(1)
    .maybeSingle();

  const initial = {
    business_name: config?.business_name ?? "Phi Phi Lounge",
    logo_url: config?.logo_url ?? null,
    primary_color: config?.primary_color ?? "#e6c364",
    welcome_message: config?.welcome_message ?? null,
    pass_strip_message: config?.pass_strip_message ?? null,
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-headline font-extrabold uppercase tracking-tighter text-[#e5e2e1]">
          Ajustes
        </h1>
        <p className="mt-1 text-sm text-[#d0c5b2]">
          Configura la identidad y los mensajes de tu programa de fidelidad.
        </p>
      </div>

      {/* Form card */}
      <div className="bg-[#1a1a1a] rounded-xl p-8 border border-white/[0.03]">
        {/* Card header */}
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[#4d4637]/10">
          <div className="p-2.5 bg-[#353534] rounded-lg">
            <span className="material-symbols-outlined text-[#e6c364] text-xl leading-none">
              tune
            </span>
          </div>
          <div>
            <h2 className="text-sm font-headline font-bold uppercase tracking-tight text-[#e5e2e1]">
              Configuración del negocio
            </h2>
            <p className="text-[10px] text-[#d0c5b2] tracking-widest uppercase">
              Registro único — los cambios se aplican globalmente
            </p>
          </div>
        </div>

        <ConfigForm initial={initial} saveConfig={saveConfig} />
      </div>
    </div>
  );
}
