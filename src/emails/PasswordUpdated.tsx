import { CSSProperties } from "react";
import { Body, Button, Head, Html, Img, Preview, Section, Text } from "react-email";
import { ENV } from "../config/env";

const baseServerUrl = ENV.SERVER_URL;
const baseFrontendUrl = ENV.FRONTEND_URL;
export default function PasswordUpdated () {
  return (
    <Html lang="en" dir="ltr">
      <Head/>
      <Preview>Your password has been updated</Preview>
      <Body style={styles.body}>
        <Section style={styles.container}>
          <Img style={styles.logo}
            src={`${baseServerUrl}/images/press-start-logo--on-light.png`}
            width="260"
            height="20"/>

          <Text style={styles.heading}>Password Updated</Text>
          <Text style={styles.text}>
            Your Press Start password has been updated successfully. You can now sign in using your new password.
          </Text>

          <Button href={`${baseFrontendUrl}/sign-in`} style={styles.button}>
            Sign In
          </Button>

          <Text style={styles.footer}>
            If you made this change, no further action is required.
          </Text>
          <Text style={styles.footer}>
            If you didn't update your password, your account may have been compromised. Please reset your password
            immediately and contact support if you need assistance.
          </Text>
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
