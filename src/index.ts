import { Hono } from "hono";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { timeout } from "hono/timeout";

import devMailRoute from "./routes/dev/mail_webhook.route";
import authRoute from "./routes/auth/auth.route";
import filesRoute from "./routes/files/files.routes";
import usersRoute from "./routes/users/users.route";
import { toNumber } from "./utils";

const app = new Hono();

console.log("Starting server...");

app.use("/*", csrf());
app.use(
  "/*",
  timeout((toNumber(process.env.APP_TIMEOUT_IN_SECONDS) ?? 5) * 1000),
);
app.use("/*", cors());
app.route("/auth", authRoute);
app.route("/files", filesRoute);
app.route("/users", usersRoute);

if (process.env.NODE_ENV === "development") {
  app.route("/dev", devMailRoute);
}

export default app;
