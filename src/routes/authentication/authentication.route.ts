import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { BrevoMailService } from "../../services/mail/impl/brevo_mail.service";
import {
	createUserSchema,
	forgotPasswordSchema,
	loginSchema,
	resetPasswordSchema,
	validateEmailSchema,
} from "./authentication.schema";
import {
	InvalidCodeError,
	PostgresAuthenticationRepository,
	UserNotFoundError,
} from "./repository/pg_authentication.repository";

const authenticationRoute = new Hono();
const email = new BrevoMailService();
const authenticationRepository = new PostgresAuthenticationRepository();
/**
 * Hash a password using bcrypt algorithm with a cost of 4
 * @param password - The password to hash
 * @returns The hashed password
 */
async function hashPassword(password: string): Promise<string> {
	return Bun.password.hash(password, {
		algorithm: "bcrypt",
		cost: 4, // number between 4-31
	});
}

/**
 * Verify a password using bcrypt algorithm
 * @param givenPassword - The password to verify
 * @param hash - The hashed password to compare against
 * @returns True if the password matches, false otherwise
 */
async function verifyPasswords(
	givenPassword: string,
	hash: string,
): Promise<boolean> {
	return Bun.password.verify(givenPassword, hash, "bcrypt");
}

/**
 * Generate a JWT
 * @param data - The data to include in the AJWT
 * @returns The JWT as a string
 */
async function generateJWT(data: {
	id: string;
	email: string;
}): Promise<string> {
	const expiresInSeconds = Number(process.env.JWT_EXPIRES_IN) ?? 60 * 60;
	return sign(
		{
			id: data.id,
			email: data.email,
			expiresIn: expiresInSeconds,
			// exp : https://hono.dev/docs/helpers/jwt#payload-validation
			exp: Math.floor(Date.now() / 1000) + expiresInSeconds, // Token expires in 60 minutes
		},
		process.env.JWT_SECRET as string,
	);
}

/**
 * Sign up a new user
 * See `createUserSchema` for the schema
 * Create a new user in the database and send a validation code to
 * the user's email
 * @returns The created user
 */
authenticationRoute.post(
	"/",
	zValidator("json", createUserSchema),
	async (c) => {
		const data = c.req.valid("json");
		// Create the user
		return authenticationRepository
			.createUser({
				email: data.email,
				passwordHash: await hashPassword(data.password),
			})
			.then((_userId: string) => {
				return authenticationRepository.createCodeForUser({
					email: data.email,
				});
			})
			.then((validateCode: string) => {
				return email.sendMail({
					email: data.email,
					subject: "Welcome to My Awesome App",
					htmlContent: `Welcome to My Awesome App, please validate your account with this validation code : ${validateCode}`,
				});
			})
			.then(() => {
				return c.json(201);
			})
			.catch((error: unknown) => {
				console.error({
					message: "Failed to create user",
					error,
				});
				return c.json({ error: "Cannot create user" }, 409);
			});
	},
);

/**
 * Validate a user
 * In order to validate a user, we need to check if validation code is valid.
 * If it is, we update the user's validation status.
 * If it is not, we do nothing to stay idempotent.
 */
authenticationRoute.post(
	"/validate",
	zValidator("json", validateEmailSchema),
	async (c) => {
		const data = c.req.valid("json");
		const valdiationCode = data.code;

		return authenticationRepository
			.validateUser({
				code: valdiationCode,
			})
			.then(() => {
				return c.json(204);
			})
			.catch((error: unknown) => {
				if (error instanceof InvalidCodeError) {
					return c.json({ error: "Invalid code" }, 401);
				}
				return c.json({ error: "Failed to validate user" }, 500);
			});
	},
);

/**
 * Forgot password
 * Create a reset code for the user and send it to their email
 */
authenticationRoute.post(
	"/forgot-password",
	zValidator("json", forgotPasswordSchema),
	async (c) => {
		const data = c.req.valid("json");
		return authenticationRepository
			.createCodeForUser({ email: data.email })
			.then((resetCode: string) => {
				return email.sendMail({
					email: data.email,
					subject: "Reset your password",
					htmlContent: `Reset your password with this validation code : ${resetCode}`,
				});
			})
			.then(() => {
				return c.json({ message: "Email sent with validation code" }, 202);
			})
			.catch((error: unknown) => {
				if (error instanceof UserNotFoundError) {
					console.warn("Trying to forgot password for an unknown user");
				}
				return c.json({ error: "Failed to create reset code" }, 400);
			});
	},
);

/**
 * Reset password
 * Reset the user's password with the reset code and set
 * the validation code as expired and the new password
 */
authenticationRoute.post(
	"/reset-password",
	zValidator("json", resetPasswordSchema),
	async (c) => {
		const data = c.req.valid("json");
		return authenticationRepository
			.resetPassword({
				code: data.code,
				newPasswordHash: await hashPassword(data.password),
			})
			.then(() => {
				return c.json({ message: "Password reset successfully" }, 200);
			})
			.catch((error: unknown) => {
				if (error instanceof UserNotFoundError) {
					console.warn("Trying to reset password for an unknown user");
				}
				if (error instanceof InvalidCodeError) {
					console.warn("Trying to reset password with an invalid code");
				}
				return c.json({ error: "Failed to reset password" }, 400);
			});
	},
);

// Log a user in
authenticationRoute.post(
	"/login",
	zValidator("json", loginSchema),
	async (c) => {
		const data = c.req.valid("json");
		// Get user with specific username
		return authenticationRepository
			.getUser({ email: data.email })
			.then(async (authUser) => {
				// Check password
				const hashedPassword = authUser.password;
				const arePasswordTheSame = await verifyPasswords(
					data.password,
					hashedPassword,
				);
				return {
					arePasswordTheSame,
					authUser,
				};
			})
			.then(({ arePasswordTheSame, authUser }) => {
				if (!arePasswordTheSame) {
					throw new Error("Invalid email or password");
				}
				return generateJWT({
					id: authUser.id,
					email: authUser.email,
				});
			})
			.then((token) => {
				return c.json({ token }, 200);
			})
			.catch((error) => {
				if (error instanceof UserNotFoundError) {
					console.warn("Trying to login for an unknown user");
				}
				return c.json({ error: "Invalid email or password" }, 401);
			});
	},
);

export default authenticationRoute;
