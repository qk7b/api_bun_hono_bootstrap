import { db } from "../../../db/db";
import { UserNotFoundError } from "../../auth/repository/pg_auth.repository";
import type { User } from "../users.type";
import type { UsersRepository } from "./users.repository";

class PostgresUsersRepository implements UsersRepository {
	async getById({ id }: { id: string }): Promise<User> {
		const [user] = await db`
            SELECT u.id, u.email, u."isValidated", u."createdAt", u."updatedAt"
            FROM users u WHERE u.id = ${id} AND u.deletedAt IS NULL
        `;
		if (!user) throw new UserNotFoundError();

		return user;
	}
}

export { PostgresUsersRepository };
