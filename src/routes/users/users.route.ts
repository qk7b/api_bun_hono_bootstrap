import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { UserNotFoundError } from "../auth/auth.repository";
import { UsersRepository } from "./users.repository";

const usersRoute = new Hono();
const usersRepository = new UsersRepository();

// Route are secured by jwt
usersRoute.use(
  "/*",
  jwt({
    secret: process.env.JWT_SECRET as string,
  }),
);

// Get me
usersRoute.get("/me", async (c) => {
  const userId = c.get("jwtPayload").id;
  return usersRepository
    .getUserInfo({ id: userId })
    .then((user) => {
      return c.json(user);
    })
    .catch((error) => {
      if (error instanceof UserNotFoundError) {
        return c.json({ error: "User not found" }, 404);
      }
      return c.json({ error: "Failed to get user" }, 500);
    });
});

export default usersRoute;
