import { z } from "zod";

export const addStampSchema = z.object({
  cardId: z.string().uuid("ID de tarjeta inválido"),
});

export type AddStampInput = z.infer<typeof addStampSchema>;

export const redeemRewardSchema = z.object({
  cardId: z.string().uuid("ID de tarjeta inválido"),
});

export type RedeemRewardInput = z.infer<typeof redeemRewardSchema>;
