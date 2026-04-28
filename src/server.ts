import { env } from "./config/env";
import { app } from "./app";

app.listen(env.port, () => {
  console.log(`[supabase-auth-server] running on http://localhost:${env.port}`);
});
