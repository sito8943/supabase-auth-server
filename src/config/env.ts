import { config } from "dotenv";

config();

function requiredValue(key: string): string {
  const value = process.env[key];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function normalizePort(rawPort: string | undefined): number {
  if (!rawPort) {
    return 3090;
  }

  const parsed = Number(rawPort);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid PORT value: ${rawPort}`);
  }

  return parsed;
}

function parseCsv(value: string | undefined, defaultValue: string): string[] {
  const source = value ?? defaultValue;
  return source
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: normalizePort(process.env.PORT),
  corsOrigins: parseCsv(process.env.CORS_ORIGIN, "http://localhost:8080"),
  bridgeKey: requiredValue("SUPABASE_BRIDGE_KEY"),
  supabaseUrl: requiredValue("SUPABASE_URL"),
  supabaseAnonKey: requiredValue("SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
};
