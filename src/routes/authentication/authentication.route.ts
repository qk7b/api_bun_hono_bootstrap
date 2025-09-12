import { zValidator } from "@hono/zod-validator";
import { PrismaClient } from "@prisma/client";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { v4 } from "uuid";
import { BrevoMailService } from "../../services/mail/impl/brevo_mail.service";
import {
  createUserSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  validateEmailSchema,
} from "./authentication.schema";

const authenticationRoute = new Hono();
const prisma = new PrismaClient();
const email = new BrevoMailService();

function hashPassword(password: string): Promise<string> {
	return Bun.password.hash(password, {
		algorithm: "bcrypt",
		cost: 4, // number between 4-31
	});
}

// Create a new user
authenticationRoute.post(
	"/",
	zValidator("json", createUserSchema),
	async (c) => {
		const data = c.req.valid("json");
		// Create the user
		try {
			const dbUser = await prisma.users.create({
				data: {
					email: data.email,
					password: await hashPassword(data.password),
				},
			});
			// Create a validation code
			const validationCode = v4();
			await prisma.userValidationCode.create({
				data: {
					id: validationCode,
					userId: dbUser.id,
					expired: false,
					// Expires in 30 minutes
					expiresAt: new Date(Date.now() + 30 * 60 * 1000),
				},
			});

			await email.sendMail({
				email: data.email,
				subject: "Welcome to My Awesome App",
				htmlContent: `Welcome to My Awesome App, please validate your account with this validation code : ${validationCode}`,
			});
			return c.json(
				{
					id: dbUser.id,
				},
				201,
			);
    } catch (error) {
      console.error({
        message: "Failed to create user",
        cause: "Email already exists",
        error
      });
			return c.json({ error: "Email already exists" }, 409);
		}
	},
);

// Validate a user
authenticationRoute.post(
	"/validate",
	zValidator("json", validateEmailSchema),
	async (c) => {
		const data = c.req.valid("json");
		const valdiationCode = data.code;
		const userId = data.userId;

		const dbValidationCode = await prisma.userValidationCode.findUnique({
			where: {
				id: valdiationCode,
				expired: false,
				expiresAt: { gt: new Date() },
				userId,
			},
		});
		if (!dbValidationCode) {
			return c.json({ error: "Invalid code" }, 401);
		}

		await prisma.users.update({
			where: { id: userId },
			data: {
				isValidated: true,
			},
		});
		await prisma.userValidationCode.update({
			where: { id: dbValidationCode.id },
			data: {
				expired: true,
			},
		});
		return c.body(null, 204);
	},
);

// Forgot password
authenticationRoute.post(
	"/forgot-password",
	zValidator("json", forgotPasswordSchema),
	async (c) => {
		const data = c.req.valid("json");
		const dbUser = await prisma.users.findUnique({
			where: { email: data.email },
		});
		if (!dbUser) {
			console.warn("Trying to forgot password for an unknown user");
			return c.json({ message: "Email sent with validation code" }, 202);
		}
		// Create a validation code
		const validationCode = v4();
		await prisma.userValidationCode.create({
			data: {
				id: validationCode,
				userId: dbUser.id,
				expired: false,
				// Expires in 5 minutes
				expiresAt: new Date(Date.now() + 5 * 60 * 1000),
			},
		});

		await email.sendMail({
			email: data.email,
			subject: "Reset your password",
			htmlContent: `Reset your password with this validation code : ${validationCode}`,
		});
		return c.json({ message: "Email sent with validation code" }, 202);
	},
);

// Reset password
authenticationRoute.post(
	"/reset-password",
	zValidator("json", resetPasswordSchema),
	async (c) => {
		const data = c.req.valid("json");
		const dbValidationCode = await prisma.userValidationCode.findUnique({
			where: { id: data.code, expired: false, expiresAt: { gt: new Date() } },
		});

		if (!dbValidationCode) {
			return c.json({ error: "Invalid or expired code" }, 401);
		}

		try {
			await prisma.$transaction([
				prisma.userValidationCode.update({
					where: { id: dbValidationCode.id },
					data: {
						expired: true,
					},
				}),
				prisma.users.update({
					where: { id: dbValidationCode.userId },
					data: {
						password: await hashPassword(data.password),
					},
				}),
			]);
			return c.body(null, 204);
		} catch (error) {
			console.error({
        message: "Failed to reset password",
        error
      });
			return c.json({ error: "Failed to reset password" }, 500);
		}
	},
);

// Log a user in
authenticationRoute.post(
	"/login",
	zValidator("json", loginSchema),
	async (c) => {
		const data = c.req.valid("json");
		// Get user with specific username
		const dbUser = await prisma.users.findUnique({
			where: { email: data.email },
		});
		if (!dbUser) {
			return c.json({ error: "Invalid email or password" }, 401);
		}
		// Check password
		if (
			!(await Bun.password.verify(data.password, dbUser.password, "bcrypt"))
		) {
			return c.json({ error: "Invalid email or password" }, 401);
		}
		// Create jwt
		const payload = {
			id: dbUser.id,
			expiresIn: 60 * 60,
			// exp : https://hono.dev/docs/helpers/jwt#payload-validation
			exp: Math.floor(Date.now() / 1000) + 60 * 60, // Token expires in 60 minutes
		};
		const token = await sign(payload, process.env.JWT_SECRET ?? "supersecret");
		// Return token
		return c.json({
			token: token,
			expiresIn: payload.expiresIn,
		});
	},
);

export default authenticationRoute;
