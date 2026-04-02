import { z } from "zod";

export const registerCustomerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Introduce un email válido"),
  marketing_consent: z.boolean().default(false),
});

export type RegisterCustomerInput = z.infer<typeof registerCustomerSchema>;
