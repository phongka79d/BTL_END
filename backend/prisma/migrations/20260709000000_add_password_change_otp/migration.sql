-- CreateTable
CREATE TABLE "PasswordChangeOtp" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "otp_hash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PasswordChangeOtp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PasswordChangeOtp_user_id_used_at_expires_at_idx" ON "PasswordChangeOtp"("user_id", "used_at", "expires_at");

-- CreateIndex
CREATE INDEX "PasswordChangeOtp_created_at_idx" ON "PasswordChangeOtp"("created_at");

-- AddForeignKey
ALTER TABLE "PasswordChangeOtp" ADD CONSTRAINT "PasswordChangeOtp_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
