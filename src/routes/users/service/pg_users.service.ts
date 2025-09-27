import { db } from '../../../db/db';
import { User, UsersService } from './users.service';

class PostgresUsersService implements UsersService {
  async getById({ id }: { id: string }): Promise<User | null> {
    const [user] = await db`
            SELECT u.id, u.email, u."createdAt", u."updatedAt"
            FROM users u WHERE u.id = ${id} AND u.deletedAt IS NULL
        `;
    if (!user) return null;
    return user;
  }
}

export { PostgresUsersService };
