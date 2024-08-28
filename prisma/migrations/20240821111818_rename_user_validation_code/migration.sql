/*
  Warnings:

  - You are about to drop the `user_validation_code` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_validation_code" DROP CONSTRAINT "user_validation_code_userId_fkey";

-- DropTable
DROP TABLE "user_validation_code";

-- CreateTable
CREATE TABLE "userValidationCode" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "expired" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "userValidationCode_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "userValidationCode" ADD CONSTRAINT "userValidationCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
