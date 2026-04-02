"use server";

import { createAnonClient } from "@/lib/supabase/server";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Introduce un email válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export async function signInWithPassword(formData: FormData) {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false as const,
      error: "validation_error" as const,
      fields: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createAnonClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      success: false as const,
      error: "auth_error" as const,
    };
  }

  return {
    success: true as const,
  };
}
