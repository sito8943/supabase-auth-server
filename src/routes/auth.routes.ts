import { Router } from "express";
import { createClient, type EmailOtpType } from "@supabase/supabase-js";
import { AppError } from "../errors/app-error";
import { supabasePublicClient } from "../lib/supabase";
import { env } from "../config/env";
import { asyncHandler } from "../utils/async-handler";
import {
  optionalString,
  parseBearerToken,
  parseObject,
  requireEmail,
  requirePassword,
  requireString
} from "../utils/request";
import { throwIfSupabaseError } from "../utils/supabase-error";

export const authRouter = Router();
const verifyOtpTypes = new Set<EmailOtpType>(["email", "recovery"]);

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const email = requireEmail(req.body?.email);
    const password = requirePassword(req.body?.password);
    const redirectTo = optionalString(req.body?.redirectTo);
    const data = parseObject(req.body?.data);

    const { data: authData, error } = await supabasePublicClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data
      }
    });

    throwIfSupabaseError(error);

    res.status(201).json({
      user: authData.user,
      session: authData.session,
      needsEmailConfirmation: !authData.session
    });
  })
);

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const email = requireEmail(req.body?.email);
    const password = requirePassword(req.body?.password);

    const { data: authData, error } = await supabasePublicClient.auth.signInWithPassword({
      email,
      password
    });

    throwIfSupabaseError(error);

    if (!authData.user || !authData.session) {
      throw new AppError(401, "Invalid credentials.");
    }

    res.status(200).json({
      user: authData.user,
      session: authData.session
    });
  })
);

authRouter.post(
  "/forgot-password",
  asyncHandler(async (req, res) => {
    const email = requireEmail(req.body?.email);
    const redirectTo = optionalString(req.body?.redirectTo);

    const { error } = await supabasePublicClient.auth.resetPasswordForEmail(email, {
      redirectTo
    });

    throwIfSupabaseError(error);
    res.status(200).json({ sent: true });
  })
);

authRouter.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const refreshToken = requireString(req.body?.refreshToken, "refreshToken");

    const { data: authData, error } = await supabasePublicClient.auth.refreshSession({
      refresh_token: refreshToken
    });

    throwIfSupabaseError(error);

    if (!authData.user || !authData.session) {
      throw new AppError(401, "Invalid refresh token.");
    }

    res.status(200).json({
      user: authData.user,
      session: authData.session
    });
  })
);

authRouter.post(
  "/update-password",
  asyncHandler(async (req, res) => {
    const accessToken = requireString(req.body?.accessToken, "accessToken");
    const refreshToken = optionalString(req.body?.refreshToken);
    const password = requirePassword(req.body?.password);

    const tokenClient = createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      ...(!refreshToken
        ? {
            global: {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            }
          }
        : {})
    });

    if (refreshToken) {
      const { error: sessionError } = await tokenClient.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });

      throwIfSupabaseError(sessionError);
    }

    const { data: authData, error } = await tokenClient.auth.updateUser({
      password
    });

    throwIfSupabaseError(error);

    if (!authData.user) {
      throw new AppError(401, "Invalid token.");
    }

    res.status(200).json({
      user: authData.user
    });
  })
);

authRouter.get(
  "/validate",
  asyncHandler(async (req, res) => {
    const token = parseBearerToken(req.header("authorization") ?? undefined);
    const { data: authData, error } = await supabasePublicClient.auth.getUser(token);

    throwIfSupabaseError(error);

    if (!authData.user) {
      throw new AppError(401, "Invalid token.");
    }

    res.status(200).json({
      valid: true,
      user: authData.user
    });
  })
);

authRouter.post(
  "/resend",
  asyncHandler(async (req, res) => {
    const email = requireEmail(req.body?.email);
    const redirectTo = optionalString(req.body?.redirectTo);
    const resendType = optionalString(req.body?.type) ?? "signup";

    if (resendType !== "signup" && resendType !== "email_change") {
      throw new AppError(400, "Field 'type' must be one of: signup, email_change.");
    }

    const { error } = await supabasePublicClient.auth.resend({
      type: resendType,
      email,
      options: {
        emailRedirectTo: redirectTo
      }
    });

    throwIfSupabaseError(error);
    res.status(200).json({ sent: true });
  })
);

authRouter.post(
  "/verify",
  asyncHandler(async (req, res) => {
    const tokenHash = requireString(req.body?.tokenHash ?? req.body?.token_hash, "tokenHash");
    const type = requireString(req.body?.type, "type").toLowerCase() as EmailOtpType;

    if (!verifyOtpTypes.has(type)) {
      throw new AppError(400, "Field 'type' must be one of: email, recovery.");
    }

    const { data: authData, error } = await supabasePublicClient.auth.verifyOtp({
      token_hash: tokenHash,
      type
    });

    if (isAlreadyConfirmedError(error)) {
      res.status(200).json({ verified: true, alreadyConfirmed: true });
      return;
    }

    throwIfSupabaseError(error);
    res.status(200).json({
      verified: true,
      user: authData.user,
      session: authData.session
    });
  })
);

function isAlreadyConfirmedError(error: { code?: string; message?: string } | null): boolean {
  if (!error) {
    return false;
  }

  const code = typeof error.code === "string" ? error.code.toLowerCase() : "";
  if (code.includes("already_confirmed")) {
    return true;
  }

  const message = typeof error.message === "string" ? error.message.toLowerCase() : "";
  return message.includes("already confirmed");
}
