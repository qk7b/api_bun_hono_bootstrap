import { Hono } from "hono";
import { cors } from "hono/cors";

import authRoute from "./routes/auth/auth.route";
import filesRoute from "./routes/files/files.routes";
import usersRoute from "./routes/users/users.route";

const app = new Hono();

console.log("Starting server...");

app.use("/*", cors());
app.route("/auth", authRoute);
app.route("/files", filesRoute);
app.route("/users", usersRoute);

export default app;
