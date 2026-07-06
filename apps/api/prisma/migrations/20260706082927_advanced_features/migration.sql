-- CreateEnum
CREATE TYPE "ViewsOnLoans" AS ENUM ('AVOID', 'NECESSARY_ONLY', 'FLEXIBLE');

-- CreateEnum
CREATE TYPE "ChatRoomStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ChatParticipantRole" AS ENUM ('MEMBER', 'WALI', 'READONLY');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'MUTUAL_MATCH';
ALTER TYPE "NotificationType" ADD VALUE 'CHAT_MESSAGE';

-- AlterTable
ALTER TABLE "IslamicProfileDetails" ADD COLUMN     "viewsOnLoans" "ViewsOnLoans";

-- AlterTable
ALTER TABLE "PartnerPreference" ADD COLUMN     "viewsOnLoansExpect" "ViewsOnLoans";

-- CreateTable
CREATE TABLE "MutualMatch" (
    "id" SERIAL NOT NULL,
    "profileLowId" INTEGER NOT NULL,
    "profileHighId" INTEGER NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notifiedAt" TIMESTAMP(3),
    "discountUsedByLow" BOOLEAN NOT NULL DEFAULT false,
    "discountUsedByHigh" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MutualMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatRoom" (
    "id" SERIAL NOT NULL,
    "profileAId" INTEGER NOT NULL,
    "profileBId" INTEGER NOT NULL,
    "mode" "ProfileMode" NOT NULL,
    "unlockId" INTEGER,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" "ChatRoomStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatParticipant" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "profileId" INTEGER,
    "role" "ChatParticipantRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "senderProfileId" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MutualMatch_profileLowId_idx" ON "MutualMatch"("profileLowId");

-- CreateIndex
CREATE INDEX "MutualMatch_profileHighId_idx" ON "MutualMatch"("profileHighId");

-- CreateIndex
CREATE UNIQUE INDEX "MutualMatch_profileLowId_profileHighId_key" ON "MutualMatch"("profileLowId", "profileHighId");

-- CreateIndex
CREATE INDEX "ChatRoom_profileAId_idx" ON "ChatRoom"("profileAId");

-- CreateIndex
CREATE INDEX "ChatRoom_profileBId_idx" ON "ChatRoom"("profileBId");

-- CreateIndex
CREATE INDEX "ChatRoom_expiresAt_status_idx" ON "ChatRoom"("expiresAt", "status");

-- CreateIndex
CREATE INDEX "ChatParticipant_userId_idx" ON "ChatParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatParticipant_roomId_userId_key" ON "ChatParticipant"("roomId", "userId");

-- CreateIndex
CREATE INDEX "ChatMessage_roomId_createdAt_idx" ON "ChatMessage"("roomId", "createdAt");

-- AddForeignKey
ALTER TABLE "MutualMatch" ADD CONSTRAINT "MutualMatch_profileLowId_fkey" FOREIGN KEY ("profileLowId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MutualMatch" ADD CONSTRAINT "MutualMatch_profileHighId_fkey" FOREIGN KEY ("profileHighId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatRoom" ADD CONSTRAINT "ChatRoom_profileAId_fkey" FOREIGN KEY ("profileAId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatRoom" ADD CONSTRAINT "ChatRoom_profileBId_fkey" FOREIGN KEY ("profileBId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatParticipant" ADD CONSTRAINT "ChatParticipant_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatParticipant" ADD CONSTRAINT "ChatParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_senderProfileId_fkey" FOREIGN KEY ("senderProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
