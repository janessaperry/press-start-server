import { Resend } from "resend";
import { ENV } from "../config/env.js";
import PasswordReset from "../emails/PasswordReset";
import SyncFailure from "../emails/SyncFailure";
import { logger } from "../errors/logger.js";

const resend = new Resend(ENV.RESEND_KEY);

const FROM = "Press Start <press-start@resend.dev>";
const ADMIN_EMAIL = "hello@janessaperry.com";

export const EmailService = {
  async sendPasswordResetEmail (email: string, token: string) {
    const resetUrl = `${ENV.FRONTEND_URL}/reset-password?token=${token}`;

    if (process.env.NODE_ENV === "development") {
      logger.info(`[DEV EMAIL] To: ${email}, Reset URL: ${resetUrl}`);
      return {
        message: "DEV: email sent"
      }
    }

    const { error } = await resend.emails.send({
      from: FROM,
      to: [ email ],
      subject: "Password Reset Request",
      react: <PasswordReset resetUrl={resetUrl} />
    })

    if (error) {
      throw new Error(error.message);
    }
  },

  async sendSyncFailureEmail (failedStages: string[]) {
    if (process.env.NODE_ENV === "development") {
      logger.info({ failedStages }, "[DEV EMAIL] Sync failure alert");
      return;
    }

    const { error } = await resend.emails.send({
      from: FROM,
      to: [ ADMIN_EMAIL ],
      subject: "Press Start — IGDB sync failed",
      react: <SyncFailure failedStages={failedStages}/>,
    });

    if (error) {
      logger.error({ err: error }, "Failed to send sync failure email");
    }
  }
}



