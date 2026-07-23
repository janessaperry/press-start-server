import { Resend } from "resend";
import { ENV } from "../config/env.js";
import PasswordReset from "../emails/PasswordReset";
import PasswordUpdated from "../emails/PasswordUpdated";
import SyncFailure from "../emails/SyncFailure";
import Welcome from "../emails/Welcome";
import { logger } from "../errors/logger.js";

const resend = new Resend(ENV.RESEND_KEY);

const FROM = "Press Start <press-start@resend.dev>";
const ADMIN_EMAIL = "hello@janessaperry.com";

export const EmailService = {
  async sendWelcomeEmail (email: string) {
    if (process.env.NODE_ENV === "development") {
      logger.info(`[DEV EMAIL: Welcome] To: ${email}`);
      return;
    }

    const { error } = await resend.emails.send({
      from: FROM,
      to: [ email ],
      subject: "Welcome to Press Start",
      react: <Welcome/>
    });

    if (error) {
      logger.error({ err: error }, "Failed to send Welcome email");
    }
  },

  async sendPasswordResetEmail (email: string, token: string) {
    const resetUrl = `${ENV.FRONTEND_URL}/reset-password?token=${token}`;

    if (process.env.NODE_ENV === "development") {
      logger.info(`[DEV EMAIL: Password Reset Request] To: ${email}, Reset URL: ${resetUrl}`);
      return;
    }

    const { error } = await resend.emails.send({
      from: FROM,
      to: [ email ],
      subject: "Password Reset Request",
      react: <PasswordReset resetUrl={resetUrl}/>
    })

    if (error) {
      throw new Error(error.message);
    }
  },

  async sendPasswordUpdatedEmail (email: string) {
    if (process.env.NODE_ENV === 'development') {
      logger.info(`[DEV EMAIL: Password Updated] To: ${email}`);
      return;
    }

    const { error } = await resend.emails.send({
      from: FROM,
      to: [ email ],
      subject: "Password Updated Successfully",
      react: <PasswordUpdated/>
    });

    if (error) {
      logger.error({ err: error }, "Failed to send Password Updated email");
    }
  },

  async sendSyncFailureEmail (failedStages: string[]) {
    if (process.env.NODE_ENV === "development") {
      logger.info({ failedStages }, `[DEV EMAIL: Sync Failure] To: ${ADMIN_EMAIL}`);
      return;
    }

    const { error } = await resend.emails.send({
      from: FROM,
      to: [ ADMIN_EMAIL ],
      subject: "Press Start - IGDB sync failed",
      react: <SyncFailure failedStages={failedStages}/>,
    });

    if (error) {
      logger.error({ err: error }, "Failed to send sync failure email");
    }
  }
}



