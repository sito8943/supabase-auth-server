import { RequestHandler } from "express";
import { env } from "../config/env";

export const requireBridgeKey: RequestHandler = (req, res, next) => {
  if (req.method.toUpperCase() === "OPTIONS") {
    next();
    return;
  }

  const headerKey = req.header("x-bridge-key");
  if (!headerKey || headerKey !== env.bridgeKey) {
    res.status(401).json({ message: "Unauthorized bridge request." });
    return;
  }

  next();
};
