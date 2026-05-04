import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { requireBridgeKey } from "./middleware/bridge-auth";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import { authRouter } from "./routes/auth.routes";

export const app = express();
const httpLogFormat =
  ':date[iso] ":method :url" :status :response-time ms - :res[content-length]B ip=:remote-addr ua=":user-agent"';

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (env.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    }
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(
  morgan(httpLogFormat, {
    skip: (req) => req.path === "/health"
  })
);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", requireBridgeKey);
app.use("/api/auth", authRouter);

app.use(notFoundHandler);
app.use(errorHandler);
