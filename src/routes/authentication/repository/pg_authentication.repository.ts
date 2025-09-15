import { db } from "../../../db/db";
import type {
	AuthenticationRepository,
	AuthUser,
} from "./authentication.repository";

class UserNotFoundError extends Error {
	constructor() {
		super("User not found");
		this.name = "UserNotFoundError";
	}
}

class InvalidCodeError extends Error {
	constructor() {
		super("Invalid code");
		this.name = "InvalidCodeError";
	}
}

class InvalidTokenError extends Error {
	constructor() {
		super("Invalid token");
		this.name = "InvalidTokenError";
	}
}

class PostgresAuthenticationRepository implements AuthenticationRepository {
	async createCodeForUser({ email }: { email: string }): Promise<string> {
		// find user
		const [user] =
			await db`SELECT u.id FROM users u WHERE u.email = ${email} AND u.deletedAt IS NULL`;
		if (!user) throw new UserNotFoundError();

		// invalidate old codes
		await db`
      UPDATE user_validation_code uc 
      SET uc.expired = true 
      WHERE uc."userId" = ${user.id} AND uc.expired = false
    `;

		// create new reset code (simple UUID, could also use OTP)
		const [resetCode] = await db`
      INSERT INTO user_validation_code ("userId", "expiresAt")
      VALUES (${user.id}, NOW() + interval '15 minutes')
      RETURNING id
    `;

		// return reset code
		return resetCode.id;
	}

	async resetPassword({
		code,
		newPasswordHash,
	}: {
		code: string;
		newPasswordHash: string;
	}): Promise<void> {
		// get code
		const [validationCode] = await db`
        SELECT uc.id, uc."userId" 
		FROM user_validation_code uc
        WHERE uc.id = ${code} AND uc.expired = false AND uc."expiresAt" > NOW()
      `;

		if (!validationCode) throw new InvalidCodeError();

		// Void code
		await db`
		UPDATE user_validation_code uc
		SET uc.expired = true
		WHERE uc.id = ${code}`;

		// get user
		const [user] = await db`
			SELECT u.id
			FROM users u
			WHERE u.id = ${validationCode.userId} AND u.deletedAt IS NULL`;
		if (!user) throw new UserNotFoundError();

		// update password
		await db`
      UPDATE users u
	  SET u.password = ${newPasswordHash}, u."updatedAt" = NOW()
      WHERE u.id = ${user.id}
    `;
	}

	async passwordForUser({ email }: { email: string }): Promise<string> {
		// find user
		const [user] = await db`
      SELECT u.password
	  FROM users u WHERE u.email = ${email} AND u.deletedAt IS NULL
    `;
		if (!user) throw new UserNotFoundError();

		return user.password;
	}

	async createUser({
		email,
		passwordHash,
	}: {
		email: string;
		passwordHash: string;
	}): Promise<string> {
		// create user
		const [user] = await db`
      INSERT INTO users (email, password)
	  VALUES (${email}, ${passwordHash})
      RETURNING id
    `;
		return user.id;
	}

	async validateUser({ code }: { code: string }): Promise<void> {
		// get use for code
		const [user] = await db`
      SELECT uc."userId" 
	  FROM user_validation_code uc
      WHERE uc.id = ${code} AND uc.expired = false AND uc."expiresAt" > NOW()
    `;

		if (!user) throw new InvalidCodeError();

		await db`
      UPDATE users
	  SET "isValidated" = true
	  WHERE id = ${user.userId}
    `;
	}

	async getUser({ email }: { email: string }): Promise<AuthUser> {
		// find user
		const [user] = await db`
      SELECT u.id, u.email, u.password, u."isValidated"
		FROM users u
		WHERE u.email = ${email} AND u.deletedAt IS NULL
    `;
		if (!user) throw new UserNotFoundError();

		return user;
	}
}

export {
	InvalidCodeError,
	InvalidTokenError,
	PostgresAuthenticationRepository,
	UserNotFoundError
};

