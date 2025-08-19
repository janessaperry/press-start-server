import { Resend } from "resend";

const { RESEND_KEY } = process.env;
const resend = new Resend(RESEND_KEY);

export const EmailService = {
  async sendPasswordResetEmail (email: string, token: string) {
    const resetUrl = `http://localhost:5173/reset-password?token=${token}`;

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



