import { db } from '../../../db/db';
import { AuthCode, AuthenticationService, AuthUser } from './auth.service';

class PostgresAuthenticationService implements AuthenticationService {
  async createUser({
    email,
    passwordHash,
  }: {
    email: string;
    passwordHash: string;
  }): Promise<string> {
    const [user] = await db`
    INSERT INTO public.users ("email")
    VALUES (${email})
    RETURNING "id"
  `;
    await db`
    INSERT INTO public.auth_providers ("provider", "hashedPassword", "userId")
    VALUES ('password', ${passwordHash}, ${user.id})
  `;
    return user.id;
  }

  async updatePassword({
    id,
    passwordHash,
  }: {
    id: string;
    passwordHash: string;
  }): Promise<void> {
    await db`
            UPDATE public.users u
            SET u."password" = ${passwordHash}
            WHERE u."id" = ${id}
        `;
    return;
  }

  async setValidated({ id }: { id: string }): Promise<void> {
    await db`
            UPDATE public.users u
            SET u."isValidated" = true
            WHERE u."id" = ${id}
        `;
  }

  async getUserByEmail({ email }: { email: string }): Promise<AuthUser | null> {
    const [user] = await db`
            SELECT u."id", u."email", u."isValidated"
            FROM public.users u
            WHERE u."email" = ${email} AND u."deletedAt" IS NULL
        `;
    return user;
  }

  async getUserById({ id }: { id: string }): Promise<AuthUser | null> {
    const [user] = await db`
            SELECT u."id", u."email", u."isValidated"
            FROM public.users u
            WHERE u."id" = ${id} AND u."deletedAt" IS NULL
        `;
    return user;
  }

  async getPasswordHashById({ userId }: { userId: string }): Promise<string | null> {
    const [pwd] = await db`
            SELECT ap."hashedPassword"
            FROM public.auth_providers ap
            WHERE ap."userId" = ${userId} AND ap."provider" = 'password'
        `;
    return pwd?.hashedPassword;
  }

  async createCodeForUser({ userId }: { userId: string }): Promise<AuthCode> {
    const [code] = await db`
              INSERT INTO public.user_validation_code ("userId", "expiresAt")
              VALUES (${userId}, NOW() + interval '15 minutes')
              RETURNING "id", "expiresAt"
            `;
    return {
      id: code.id,
      userId,
      voided: false,
      expiresAt: code.expiresAt,
    };
  }

  async updateCode({
    id,
    voided,
  }: {
    id: string;
    voided: boolean;
  }): Promise<void> {
    await db`
            UPDATE public.user_validation_code uc
            SET uc."voided" = ${voided}
            WHERE uc."id" = ${id}
        `;
    return;
  }

  async getCode({ id }: { id: string }): Promise<AuthCode | null> {
    const [code] = await db`
            SELECT uc."id", uc."voided", uc."userId", uc."expiresAt"
            FROM public.user_validation_code uc
            WHERE uc."id" = ${id} AND uc."voided" = false AND uc."expiresAt" > NOW()
        `;
    return code;
  }

  async getCodesForUser({ userId }: { userId: string }): Promise<AuthCode[]> {
    const codes = await db`
            SELECT uc."id", uc."voided", uc."userId", uc."expiresAt"
            FROM public.user_validation_code uc
            WHERE uc."userId" = ${userId} AND uc."voided" = false AND uc."expiresAt" > NOW()
        `;
    return codes || [];
  }
}

export default PostgresAuthenticationService;
