-- DropForeignKey
ALTER TABLE "userValidationCode" DROP CONSTRAINT "userValidationCode_userId_fkey";

-- AddForeignKey
ALTER TABLE "userValidationCode" ADD CONSTRAINT "userValidationCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
