-- Database schema for api_bun_hono_bootstrap

-- Users table
CREATE TABLE IF NOT EXISTS "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL UNIQUE,
    "isValidated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "users_email_key" UNIQUE ("email")
);

-- Create the authentication method table
CREATE TABLE IF NOT EXISTS "auth_providers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "provider" TEXT NOT NULL,  -- 'password', 'google', 'apple', 'discord'
    "providerUserId" TEXT,     -- ex: sub Google/Apple, id Discord, null pour password
    "hashedPassword" TEXT,     -- uniquement rempli si provider = 'password'
    "accessToken" TEXT,        -- optionnel (si besoin d'appeler API Google/Discord)
    "refreshToken" TEXT,       -- optionnel
    "expiresAt" TIMESTAMPTZ,   -- optionnel
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_providers_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "auth_providers_user_provider_unique" UNIQUE ("userId", "provider"),
    CONSTRAINT "auth_providers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- User validation codes table
CREATE TABLE IF NOT EXISTS "user_validation_code" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "voided" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_validation_code_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "user_validation_code_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Files table
CREATE TABLE IF NOT EXISTS "files" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- User files table
CREATE TABLE IF NOT EXISTS "user_files" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "fileId" UUID NOT NULL,
    "public" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "user_files_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "user_files_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_files_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
