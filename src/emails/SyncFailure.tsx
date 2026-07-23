import { CSSProperties } from "react";
import { Body, Head, Html, Img, Preview, Section, Text, } from "react-email";
import { ENV } from "../config/env";

type Props = {
  failedStages: string[];
  occurredAt?: Date;
  environment?: string;
};

const baseUrl = ENV.SERVER_URL;
export default function SyncFailure ({
  failedStages = [ "Stage 1", "Stage 2" ],
  occurredAt = new Date(),
  environment = "Production"
}: Props) {
  const formattedDate = occurredAt.toLocaleString("en-CA", {
    dateStyle: "medium",
    timeStyle: "long",
  });

  return (
    <Html lang="en" dir="ltr">
      <Head/>
      <Preview>
        IGDB sync failed in {String(failedStages.length)} stage
        {failedStages.length === 1 ? "" : "s"}
      </Preview>

      <Body style={styles.body}>
        <Section style={styles.container}>
          <Img style={styles.logo} src={`${baseUrl}/images/press-start-logo--on-light.png`} width="260" height="20"/>

          <Text style={styles.heading}>Weekly IGDB Sync Failed</Text>
          <Text style={styles.text}>
            The weekly IGDB sync encountered errors and did not complete successfully.
          </Text>

          <Section style={styles.details}>
            <Text style={styles.detail}>
              <strong>Environment:</strong> {environment}
            </Text>
            <Text style={styles.detail}>
              <strong>Occurred at:</strong> {formattedDate}
            </Text>
          </Section>

          <Text style={styles.subheading}>Failed stages</Text>
          <Section style={styles.failedStages}>
            {failedStages.map((stage) => (
              <Text key={stage} style={styles.failedStage}>
                • {stage}
              </Text>
            ))}
          </Section>

          <Text style={styles.footer}>
            Check the Railway logs for the related error messages and stack traces.
          </Text>
        </Section>
      </Body>
    </Html>
  );
}

const styles: Record<string, CSSProperties> = {
  body: {
    backgroundColor: "#B5B4BC",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  container: {
    backgroundColor: "#F2F2F2",
    margin: "40px auto",
    padding: "32px",
    borderRadius: "8px",
    maxWidth: "480px",
  },
  logo: {
    margin: 'auto'
  },
  heading: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#111111",
    marginBottom: '16px',
  },
  subheading: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#111111",
    margin: "24px 0 8px",
  },
  text: {
    fontSize: "14px",
    color: "#444444",
    lineHeight: "1.5",
  },
  details: {
    backgroundColor: "#E5E5E9",
    borderRadius: "6px",
    padding: "12px 16px",
    marginTop: "20px",
  },
  detail: {
    fontSize: "14px",
    color: "#444444",
    lineHeight: "1.4",
    margin: "4px 0",
  },
  failedStages: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #d4d4d8",
    borderRadius: "6px",
    padding: "12px 16px",
  },
  failedStage: {
    fontSize: "14px",
    color: "#730962",
    lineHeight: "1.4",
    margin: "0",
  },
  footer: {
    fontSize: "12px",
    color: "#777777",
    lineHeight: "1.4",
    marginTop: "24px",
  },
};