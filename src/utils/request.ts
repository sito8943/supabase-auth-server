import { AppError } from "../errors/app-error";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new AppError(400, `Field '${field}' is required and must be a non-empty string.`);
  }
  return value.trim();
}

export function optionalString(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new AppError(400, "Optional string fields must be valid strings.");
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function requireEmail(value: unknown, field = "email"): string {
  const email = requireString(value, field).toLowerCase();
  if (!EMAIL_REGEX.test(email)) {
    throw new AppError(400, `Field '${field}' must be a valid email.`);
  }
  return email;
}

export function requirePassword(value: unknown, field = "password"): string {
  const password = requireString(value, field);
  if (password.length < 6) {
    throw new AppError(400, `Field '${field}' must be at least 6 characters.`);
  }
  return password;
}

export function parseBearerToken(authorization: string | undefined): string {
  if (!authorization) {
    throw new AppError(401, "Missing Authorization header.");
  }

  const [scheme, token] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    throw new AppError(401, "Authorization header must be Bearer <token>.");
  }
  return token;
}

export function parseObject(value: unknown): Record<string, unknown> | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== "object" || Array.isArray(value)) {
    throw new AppError(400, "Field 'data' must be a JSON object.");
  }
  return value as Record<string, unknown>;
}
