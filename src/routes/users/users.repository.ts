import { usersService } from './service';
import { User } from './service/users.service';

class UsersRepository {
  async getUserInfo({ id }: { id: string }): Promise<User | null> {
    return usersService.getById({ id });
  }
}

export { UsersRepository };
