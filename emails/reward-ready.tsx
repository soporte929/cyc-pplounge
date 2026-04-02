import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
} from "@react-email/components";

interface RewardReadyEmailProps {
  name: string;
  rewardName: string;
}

export function RewardReadyEmail({ name, rewardName }: RewardReadyEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Text style={brand}>PHI PHI LOUNGE</Text>
          <Hr style={hr} />
          <Text style={heading}>¡Tu reward está listo!</Text>
          <Text style={text}>
            Hola {name}, has desbloqueado tu recompensa.
          </Text>
          <Section style={rewardBox}>
            <Text style={rewardIcon}>🎁</Text>
            <Text style={rewardName_style}>{rewardName}</Text>
          </Section>
          <Text style={text}>
            Muestra tu tarjeta al staff en tu próxima visita para canjearlo.
          </Text>
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

const rewardBox = {
  backgroundColor: "#c9a84c",
  borderRadius: "12px",
  padding: "32px 24px",
  margin: "16px 0",
  textAlign: "center" as const,
};

const rewardIcon = {
  fontSize: "40px",
  textAlign: "center" as const,
  margin: "0",
};

const rewardName_style = {
  color: "#3d2e00",
  fontSize: "20px",
  fontWeight: "800" as const,
  textAlign: "center" as const,
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
};

const footer = {
  color: "#99907e",
  fontSize: "11px",
  textAlign: "center" as const,
  marginTop: "32px",
};
