import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
} from "@react-email/components";

interface NewStampEmailProps {
  name: string;
  stampsCurrent: number;
  stampsRequired: number;
}

export function NewStampEmail({
  name,
  stampsCurrent,
  stampsRequired,
}: NewStampEmailProps) {
  const remaining = stampsRequired - stampsCurrent;

  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Text style={brand}>PHI PHI LOUNGE</Text>
          <Hr style={hr} />
          <Text style={heading}>Nuevo sello</Text>
          <Text style={text}>
            Hola {name}, acabas de recibir un sello.
          </Text>
          <Section style={stampBox}>
            <Text style={stampCount}>
              {stampsCurrent} / {stampsRequired}
            </Text>
          </Section>
          {remaining > 0 ? (
            <Text style={text}>
              Te faltan {remaining} sello{remaining === 1 ? "" : "s"} para tu
              próximo reward.
            </Text>
          ) : (
            <Text style={{ ...text, color: "#e6c364", fontWeight: "bold" }}>
              ¡Has alcanzado el objetivo! Tu reward te espera.
            </Text>
          )}
          <Hr style={hr} />
          <Text style={footer}>Phi Phi Lounge — Tu programa de fidelización</Text>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: "#131313",
  fontFamily: "Inter, sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "400px",
};

const brand = {
  color: "#e6c364",
  fontSize: "14px",
  fontWeight: "900" as const,
  letterSpacing: "0.2em",
  textAlign: "center" as const,
};

const hr = {
  borderColor: "rgba(230, 195, 100, 0.1)",
  margin: "24px 0",
};

const heading = {
  color: "#e5e2e1",
  fontSize: "24px",
  fontWeight: "800" as const,
  textAlign: "center" as const,
};

const text = {
  color: "#d0c5b2",
  fontSize: "14px",
  lineHeight: "1.6",
  textAlign: "center" as const,
};

const stampBox = {
  backgroundColor: "#1c1b1b",
  borderRadius: "12px",
  padding: "24px",
  margin: "16px 0",
  textAlign: "center" as const,
};

const stampCount = {
  color: "#e6c364",
  fontSize: "32px",
  fontWeight: "900" as const,
  textAlign: "center" as const,
};

const footer = {
  color: "#99907e",
  fontSize: "11px",
  textAlign: "center" as const,
  marginTop: "32px",
};
