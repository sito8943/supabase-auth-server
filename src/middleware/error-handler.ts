import { ErrorRequestHandler, RequestHandler } from "express";
import { AppError } from "../errors/app-error";
import { env } from "../config/env";

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({
    message: "Route not found."
  });
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.status).json({
      message: error.message,
      code: error.code,
      details: error.details
    });
    return;
  }

  const message = error instanceof Error ? error.message : "Internal server error.";
  res.status(500).json({
    message,
    ...(env.nodeEnv !== "production" && { stack: error instanceof Error ? error.stack : undefined })
  });
};
