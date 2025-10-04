import authService from './service';
import { AuthUser } from './service/auth.service';

class UserNotFoundError extends Error {
  constructor() {
    super('User not found');
    this.name = 'UserNotFoundError';
  }
}

class InvalidCodeError extends Error {
  constructor() {
    super('Invalid code');
    this.name = 'InvalidCodeError';
  }
}

class InvalidTokenError extends Error {
  constructor() {
    super('Invalid token');
    this.name = 'InvalidTokenError';
  }
}

class AuthRepository {
  async createCodeForUser({ email }: { email: string }): Promise<string> {
    const user = await authService.getUserByEmail({ email });
    if (!user) throw new UserNotFoundError();

    const codes = await authService.getCodesForUser({ userId: user.id });
    if (codes.length > 0) {
      const activeCodes = codes.filter(
        (code) => !code.voided && code.expiresAt > new Date()
      );
      for (const code of activeCodes) {
        await authService.updateCode({ id: code.id, voided: true });
      }
    }

    const code = await authService.createCodeForUser({ userId: user.id });

    return code.id;
  }

  async resetPassword({
    code,
    newPasswordHash,
  }: {
    code: string;
    newPasswordHash: string;
  }): Promise<void> {
    // Get code
    const validationCode = await authService.getCode({ id: code });
    if (!validationCode) throw new InvalidCodeError();

    // Void code
    await authService.updateCode({ id: code, voided: true });

    // get user
    const user = await authService.getUserById({ id: validationCode.userId });
    if (!user) throw new UserNotFoundError();

    // update user password
    await authService.updatePassword({
      id: user.id,
      passwordHash: newPasswordHash,
    });
  }

  async passwordForUser({ userId }: { userId: string }): Promise<string> {
    const password = await authService.getPasswordHashById({ userId: userId });
    if (!password) throw new UserNotFoundError();

    return password;
  }

  async createUser({
    email,
    passwordHash,
  }: {
    email: string;
    passwordHash: string;
  }): Promise<string> {
    const userId = await authService.createUser({ email, passwordHash });
    return userId;
  }

  async validateUser({ code }: { code: string }): Promise<void> {
    // get use for code
    const validationCode = await authService.getCode({ id: code });
    if (!validationCode) throw new InvalidCodeError();

    // void code
    await authService.updateCode({ id: code, voided: true });

    // Get user
    const user = await authService.getUserById({ id: validationCode.userId });
    if (!user) throw new UserNotFoundError();

    // Update user
    await authService.setValidated({ id: user.id });
  }

  async getUser({ email }: { email: string }): Promise<AuthUser> {
    const user = await authService.getUserByEmail({ email });
    if (!user) throw new UserNotFoundError();
    return user;
  }
}

export {
  AuthRepository,
  InvalidCodeError,
  InvalidTokenError,
  UserNotFoundError,
};
