import { Hono } from "hono";

const mailWebHook = new Hono();

// Log every request made to the webhook
mailWebHook.post("/mail", (c) => {
  console.log(c.req.json());
  return c.json({ message: "OK" }, 200);
});

export default mailWebHook;
