import type { YggdrasilConfig } from "yggdrasil-cli";

const config: YggdrasilConfig = {
  projectName: "cyc-pplounge",
  stack: {
    framework: "nextjs",
    database: "supabase",
    auth: "supabase-auth",
    payments: "none",
  },
  rigor: {
    default: "auto",
    criticalDomains: ["billing", "auth"],
  },
  devServer: {
    command: "npm run dev",
    port: 3000,
    healthCheck: "http://localhost:3000",
  },
  context: {
    contextWindow: 200_000,
    correctionFactor: 1.5,
    thresholds: {
      half: 0.50,
      warning: 0.70,
      critical: 0.90,
    },
  },
};

export default config;
