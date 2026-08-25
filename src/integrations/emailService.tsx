import { Resend } from "resend";
import { ENV } from "../config/env.js";
import PasswordReset from "../emails/PasswordReset";
import PasswordUpdated from "../emails/PasswordUpdated";
import SyncFailure from "../emails/SyncFailure";
import Welcome from "../emails/Welcome";
import { ExternalServiceError } from "../errors/AppError.js";
import { logger } from "../errors/logger.js";

const resend = new Resend(ENV.RESEND_KEY);

const FROM = "Press Start <noreply@ps.justpixels.dev>";
const ADMIN_EMAIL = "hello@justpixels.com";

export const EmailService = {
  async sendWelcomeEmail (email: string) {
    if (process.env.NODE_ENV === "development") {
      logger.info(`[DEV EMAIL: Welcome] To: ${email}`);
      return;
    }

    try {
      const { error } = await resend.emails.send({
        from: FROM,
        to: [ email ],
        subject: "Welcome to Press Start",
        react: <Welcome/>
      });

      if (error) logger.error({ err: error }, "Failed to send Welcome email");
    } catch (err) {
      logger.error({ err }, "Failed to send Welcome email");
    }
  },

  async sendPasswordResetEmail (email: string, token: string) {
    const resetUrl = `${ENV.FRONTEND_URL}/reset-password?token=${token}`;

    if (process.env.NODE_ENV === "development") {
      logger.info(`[DEV EMAIL: Password Reset Request] To: ${email}, Reset URL: ${resetUrl}`);
      return;
    }

    let result;
    try {
      result = await resend.emails.send({
        from: FROM,
        to: [ email ],
        subject: "Password Reset Request",
        react: <PasswordReset resetUrl={resetUrl}/>
      });
    } catch (err) {
      logger.error({ err }, "Failed to send password reset email");
      throw new ExternalServiceError("Failed to send password reset email");
    }

    if (result.error) throw new ExternalServiceError("Failed to send password reset email");
  },

  async sendPasswordUpdatedEmail (email: string) {
    if (process.env.NODE_ENV === 'development') {
      logger.info(`[DEV EMAIL: Password Updated] To: ${email}`);
      return;
    }

    try {
      const { error } = await resend.emails.send({
        from: FROM,
        to: [ email ],
        subject: "Password Updated Successfully",
        react: <PasswordUpdated/>
      });

      if (error) logger.error({ err: error }, "Failed to send Password Updated email");
    } catch (err) {
      logger.error({ err }, "Failed to send Password Updated email");
    }
  },

  async sendSyncFailureEmail (failedStages: string[]) {
    if (process.env.NODE_ENV === "development") {
      logger.info({ failedStages }, `[DEV EMAIL: Sync Failure] To: ${ADMIN_EMAIL}`);
      return;
    }

    try {
      const { error } = await resend.emails.send({
        from: FROM,
        to: [ ADMIN_EMAIL ],
        subject: "Press Start - IGDB sync failed",
        react: <SyncFailure failedStages={failedStages}/>,
      });

      if (error) logger.error({ err: error }, "Failed to send sync failure email");
    } catch (err) {
      logger.error({ err }, "Failed to send sync failure email");
    }
  }
}



