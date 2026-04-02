import { Resend } from "resend";
import { NewStampEmail } from "@/emails/new-stamp";
import { RewardReadyEmail } from "@/emails/reward-ready";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "Phi Phi Lounge <onboarding@resend.dev>";

export async function sendStampEmail(
  to: string,
  name: string,
  stampsCurrent: number,
  stampsRequired: number
) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Nuevo sello — ${stampsCurrent}/${stampsRequired}`,
      react: NewStampEmail({ name, stampsCurrent, stampsRequired }),
    });
  } catch (error) {
    console.error("Failed to send stamp email:", error);
  }
}

export async function sendRewardReadyEmail(
  to: string,
  name: string,
  rewardName: string
) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `¡Tu reward está listo!`,
      react: RewardReadyEmail({ name, rewardName }),
    });
  } catch (error) {
    console.error("Failed to send reward email:", error);
  }
}
