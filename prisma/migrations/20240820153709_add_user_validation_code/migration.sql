-- CreateTable
CREATE TABLE "user_validation_code" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "expired" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_validation_code_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_validation_code" ADD CONSTRAINT "user_validation_code_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
