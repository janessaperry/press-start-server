import { CSSProperties } from "react";
import { Body, Button, Head, Html, Img, Link, Preview, Section, Text } from "react-email";
import { ENV } from "../config/env";

type Props = {
  resetUrl: string;
}

const baseServerUrl = ENV.SERVER_URL;
const baseFrontendUrl = ENV.FRONTEND_URL;
export default function PasswordReset ({ resetUrl = `${baseFrontendUrl}/reset-password?token=preview-token` }: Props) {
  return (
    <Html lang="en" dir="ltr">
      <Head/>
      <Preview>Reset your password</Preview>
      <Body style={styles.body}>
        <Section style={styles.container}>
          <Img style={styles.logo}
            src={`${baseServerUrl}/images/press-start-logo--on-light.png`}
            width="260"
            height="20"/>

          <Text style={styles.heading}>Password Reset Request</Text>
          <Text style={styles.text}>
            We received a request to reset the password for your account.
          </Text>

          <Button href={resetUrl} style={styles.button}>
            Reset Password
          </Button>

          <Text style={styles.linkText}>
            Or copy and paste this link into your browser:
          </Text>
          <Link href={resetUrl} style={styles.link}>{resetUrl}</Link>

          <Text style={styles.footer}>
            If you didn't request a password reset, you can safely ignore this email.
            Your password won't change unless you use the link above.
          </Text>
          <Text style={styles.footer}>This link will expire in 1 hour.</Text>
        </Section>
      </Body>
    </Html>
  );
}

const styles: Record<string, CSSProperties> = {
  body: {
    backgroundColor: '#B5B4BC',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  container: {
    backgroundColor: '#F2F2F2',
    margin: '40px auto',
    padding: '32px',
    borderRadius: '8px',
    maxWidth: '480px',
  },
  logo: {
    margin: 'auto'
  },
  heading: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111111',
    marginBottom: '16px',
  },
  text: {
    fontSize: '14px',
    color: '#444444',
    lineHeight: '1.5',
  },
  button: {
    display: 'inline-block',
    backgroundColor: '#730962',
    color: '#E1E1E7',
    textDecoration: 'none',
    padding: '12px 20px',
    borderRadius: '999px',
    fontWeight: '600',
    fontSize: '14px',
    margin: '12px 0',
    cursor: 'pointer'
  },
  linkText: {
    fontSize: '14px',
    color: '#444444',
    lineHeight: '1',
    marginBottom: '0'
  },
  link: {
    fontSize: '12px',
    color: '#730962',
    wordBreak: 'break-all',
  },
  footer: {
    fontSize: '12px',
    color: '#888888',
    marginTop: '16px',
    lineHeight: '1.4'
  },
};
