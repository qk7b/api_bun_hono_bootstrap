import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { UserNotFoundError } from "../auth/repository/pg_auth.repository";
import { PostgresUsersRepository } from "./repository/pg_users.repository";

const usersRoute = new Hono();
const userRepository = new PostgresUsersRepository();

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
  return userRepository
    .getById({ id: userId })
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
