import { Resend } from "resend";
import { ENV } from "../config/env.js";

const resend = new Resend(ENV.RESEND_KEY);

export const EmailService = {
  async sendPasswordResetEmail (email: string, token: string) {
    const resetUrl = `http://localhost:5173/reset-password?token=${token}`;

    if ( process.env.NODE_ENV === "development" ) {
      console.log(`[DEV EMAIL] To: ${email}, Reset URL: ${resetUrl}`)
      return {
        message: "DEV: email sent"
      }
    }

    const { error } = await resend.emails.send({
      from: "Press Start <press-start@resend.dev>",
      to: [ email ],
      subject: "hello world",
      html: `<strong>it works!</strong> password reset url: <a href="${resetUrl}">${resetUrl}</a>`,
    });

    if ( error ) {
      throw new Error(error.message);
    }
  }
}



