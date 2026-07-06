-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('COUNTRY', 'DIVISION', 'DISTRICT', 'UPAZILA');

-- CreateEnum
CREATE TYPE "ProfileMode" AS ENUM ('ISLAMIC', 'GENERAL');

-- CreateEnum
CREATE TYPE "ProfileStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'HIDDEN', 'REJECTED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('NEVER_MARRIED', 'MARRIED', 'DIVORCED', 'WIDOWED', 'WIDOWER');

-- CreateEnum
CREATE TYPE "Complexion" AS ENUM ('VERY_FAIR', 'FAIR', 'MEDIUM', 'OLIVE', 'DARK');

-- CreateEnum
CREATE TYPE "BloodGroup" AS ENUM ('A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('BELOW_SSC', 'SSC', 'HSC', 'DIPLOMA', 'BACHELORS', 'MASTERS', 'DOCTORATE', 'MADRASA_QAWMI', 'MADRASA_ALIA', 'HAFEZ', 'ALIM', 'OTHER');

-- CreateEnum
CREATE TYPE "FamilyStatus" AS ENUM ('LOWER_CLASS', 'LOWER_MIDDLE_CLASS', 'MIDDLE_CLASS', 'UPPER_MIDDLE_CLASS', 'UPPER_CLASS');

-- CreateEnum
CREATE TYPE "FamilyValues" AS ENUM ('TRADITIONAL', 'MODERATE', 'LIBERAL', 'RELIGIOUS');

-- CreateEnum
CREATE TYPE "Religion" AS ENUM ('ISLAM', 'HINDUISM', 'CHRISTIANITY', 'BUDDHISM', 'OTHER');

-- CreateEnum
CREATE TYPE "Aqidah" AS ENUM ('AHLE_SUNNAH_WAL_JAMAAH', 'SALAFI', 'DEOBANDI', 'BARELVI', 'OTHER');

-- CreateEnum
CREATE TYPE "Madhhab" AS ENUM ('HANAFI', 'SHAFII', 'MALIKI', 'HANBALI', 'AHLE_HADITH', 'NONE');

-- CreateEnum
CREATE TYPE "PrayerFrequency" AS ENUM ('FIVE_TIMES_DAILY', 'MOSTLY', 'SOMETIMES', 'RARELY', 'NEVER');

-- CreateEnum
CREATE TYPE "BeardStyle" AS ENUM ('FULL_SUNNAH', 'TRIMMED', 'NONE');

-- CreateEnum
CREATE TYPE "HijabStyle" AS ENUM ('NIQAB_WITH_ABAYA', 'HIJAB_WITH_ABAYA', 'HIJAB_ONLY', 'MODEST_DRESS', 'NONE');

-- CreateEnum
CREATE TYPE "QuranMemorization" AS ENUM ('FULL_HAFEZ', 'MULTIPLE_JUZ', 'FEW_SURAHS', 'LEARNING', 'NONE');

-- CreateEnum
CREATE TYPE "QuranRecitation" AS ENUM ('FLUENT_WITH_TAJWEED', 'FLUENT', 'LEARNING', 'CANNOT_READ');

-- CreateEnum
CREATE TYPE "PolygynyPreference" AS ENUM ('ACCEPTABLE', 'NOT_ACCEPTABLE', 'CONDITIONAL', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "GuardianRelation" AS ENUM ('FATHER', 'MOTHER', 'BROTHER', 'SISTER', 'UNCLE', 'GRANDFATHER', 'OTHER');

-- CreateEnum
CREATE TYPE "SmokingHabit" AS ENUM ('NEVER', 'OCCASIONALLY', 'REGULARLY', 'QUIT');

-- CreateEnum
CREATE TYPE "DrinkingHabit" AS ENUM ('NEVER', 'OCCASIONALLY', 'REGULARLY', 'QUIT');

-- CreateEnum
CREATE TYPE "DietPreference" AS ENUM ('HALAL_ONLY', 'VEGETARIAN', 'NON_VEGETARIAN', 'VEGAN', 'NO_PREFERENCE');

-- CreateEnum
CREATE TYPE "ProfileVisibility" AS ENUM ('PUBLIC', 'VERIFIED_ONLY', 'HIDDEN');

-- CreateEnum
CREATE TYPE "PhotoPolicy" AS ENUM ('VISIBLE', 'BLURRED', 'ON_ACCEPT', 'ON_UNLOCK');

-- CreateEnum
CREATE TYPE "ContactPolicy" AS ENUM ('ON_UNLOCK', 'ON_ACCEPT', 'VERIFIED_ONLY');

-- CreateEnum
CREATE TYPE "MemberRelationship" AS ENUM ('SELF', 'FATHER', 'MOTHER', 'BROTHER', 'SISTER', 'GUARDIAN');

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('OWNER', 'MANAGER');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('PHOTO', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "InterestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "InsightSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INTEREST_RECEIVED', 'INTEREST_ACCEPTED', 'INTEREST_REJECTED', 'BIODATA_UNLOCKED', 'VERIFICATION_RESULT', 'PROFILE_APPROVED', 'PROFILE_REJECTED', 'PAYMENT_SUCCESS', 'SUBSCRIPTION_ACTIVATED', 'MEMBER_INVITE', 'JOURNEY_UPDATED', 'SYSTEM');

-- CreateEnum
CREATE TYPE "PlanInterval" AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LedgerEntryType" AS ENUM ('PURCHASE', 'SPEND_UNLOCK', 'REFUND', 'ADMIN_ADJUSTMENT', 'BONUS');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('CREDIT_PACKAGE', 'SUBSCRIPTION');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('SSLCOMMERZ', 'BKASH', 'MANUAL');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('INITIATED', 'SUCCESS', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "UnlockType" AS ENUM ('CONTACT', 'GUARDIAN', 'FULL_BIODATA');

-- CreateEnum
CREATE TYPE "UnlockSource" AS ENUM ('PURCHASE', 'INTEREST_ACCEPTED', 'ADMIN');

-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('EMAIL', 'PHONE', 'NID', 'FACE', 'SCHOLAR', 'GUARDIAN');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "JourneyStage" AS ENUM ('ACCEPTED', 'FAMILY_DISCUSSION', 'MEETING', 'ENGAGEMENT', 'MARRIED', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "otpExpiresAt" TIMESTAMP(3),
ADD COLUMN     "otpPurpose" TEXT,
ADD COLUMN     "phoneVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "preferredLanguage" TEXT NOT NULL DEFAULT 'en';

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "type" "LocationType" NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameBn" TEXT NOT NULL,
    "parentId" INTEGER,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" SERIAL NOT NULL,
    "biodataNo" TEXT NOT NULL,
    "mode" "ProfileMode" NOT NULL,
    "status" "ProfileStatus" NOT NULL DEFAULT 'DRAFT',
    "createdByUserId" INTEGER NOT NULL,
    "fullName" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "heightCm" INTEGER,
    "weightKg" INTEGER,
    "complexion" "Complexion",
    "bloodGroup" "BloodGroup" DEFAULT 'UNKNOWN',
    "maritalStatus" "MaritalStatus" NOT NULL DEFAULT 'NEVER_MARRIED',
    "childrenCount" INTEGER DEFAULT 0,
    "religion" "Religion" NOT NULL DEFAULT 'ISLAM',
    "countryId" INTEGER,
    "divisionId" INTEGER,
    "districtId" INTEGER,
    "upazilaId" INTEGER,
    "presentAddress" TEXT,
    "permanentAddress" TEXT,
    "isExpat" BOOLEAN NOT NULL DEFAULT false,
    "educationLevel" "EducationLevel",
    "educationDetails" TEXT,
    "professionKey" TEXT,
    "professionDetails" TEXT,
    "monthlyIncomeBdt" INTEGER,
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "fatherAlive" BOOLEAN,
    "fatherOccupation" TEXT,
    "motherAlive" BOOLEAN,
    "motherOccupation" TEXT,
    "brothersCount" INTEGER,
    "sistersCount" INTEGER,
    "familyStatus" "FamilyStatus",
    "familyValues" "FamilyValues",
    "familyDetails" TEXT,
    "hasHealthIssues" BOOLEAN,
    "healthDetails" TEXT,
    "aboutMe" TEXT,
    "partnerExpectation" TEXT,
    "futureGoals" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "completionPercent" INTEGER NOT NULL DEFAULT 0,
    "readinessPercent" INTEGER NOT NULL DEFAULT 0,
    "greenFlags" JSONB NOT NULL DEFAULT '[]',
    "verificationBadges" JSONB NOT NULL DEFAULT '[]',
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "boostedUntil" TIMESTAMP(3),
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IslamicProfileDetails" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER NOT NULL,
    "aqidah" "Aqidah",
    "madhhab" "Madhhab",
    "prayerFrequency" "PrayerFrequency",
    "praysInCongregation" BOOLEAN,
    "practicingSince" TEXT,
    "beardStyle" "BeardStyle",
    "wearsAboveAnkles" BOOLEAN,
    "hijabStyle" "HijabStyle",
    "mahramCompliance" BOOLEAN,
    "quranMemorization" "QuranMemorization",
    "quranRecitation" "QuranRecitation",
    "islamicEducation" TEXT,
    "madrasaBackground" BOOLEAN,
    "islamicActivities" TEXT,
    "dawahInvolvement" TEXT,
    "listensToMusic" BOOLEAN,
    "watchesDramas" BOOLEAN,
    "dressOutside" TEXT,
    "deenPracticeDetails" TEXT,
    "marriageExpectations" TEXT,
    "polygynyPreference" "PolygynyPreference",
    "waliName" TEXT,
    "waliRelation" "GuardianRelation",
    "waliPhone" TEXT,
    "waliApproves" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IslamicProfileDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneralProfileDetails" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER NOT NULL,
    "smoking" "SmokingHabit",
    "drinking" "DrinkingHabit",
    "diet" "DietPreference",
    "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "hobbies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "personalityTraits" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "careerGoals" TEXT,
    "socialPreferences" TEXT,
    "travelPreference" TEXT,
    "galleryEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneralProfileDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerPreference" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER NOT NULL,
    "ageMin" INTEGER,
    "ageMax" INTEGER,
    "heightCmMin" INTEGER,
    "heightCmMax" INTEGER,
    "maritalStatuses" "MaritalStatus"[] DEFAULT ARRAY[]::"MaritalStatus"[],
    "educationLevels" "EducationLevel"[] DEFAULT ARRAY[]::"EducationLevel"[],
    "professionKeys" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "districtIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "divisionIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "familyStatuses" "FamilyStatus"[] DEFAULT ARRAY[]::"FamilyStatus"[],
    "minPrayerFrequency" "PrayerFrequency",
    "hijabExpectation" "HijabStyle",
    "beardExpectation" "BeardStyle",
    "quranExpectation" "QuranMemorization",
    "acceptsChildren" BOOLEAN,
    "acceptsExpat" BOOLEAN,
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "otherExpectations" TEXT,
    "dealBreakers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrivacySettings" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER NOT NULL,
    "visibility" "ProfileVisibility" NOT NULL DEFAULT 'PUBLIC',
    "photoPolicy" "PhotoPolicy" NOT NULL DEFAULT 'ON_UNLOCK',
    "contactPolicy" "ContactPolicy" NOT NULL DEFAULT 'ON_UNLOCK',
    "hidePhone" BOOLEAN NOT NULL DEFAULT true,
    "hideLocation" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrivacySettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileMember" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "profileId" INTEGER NOT NULL,
    "relationship" "MemberRelationship" NOT NULL,
    "role" "MemberRole" NOT NULL DEFAULT 'MANAGER',
    "inviteStatus" "InviteStatus" NOT NULL DEFAULT 'ACCEPTED',
    "invitedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileMedia" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER NOT NULL,
    "type" "MediaType" NOT NULL DEFAULT 'PHOTO',
    "url" TEXT NOT NULL,
    "blurredUrl" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interest" (
    "id" SERIAL NOT NULL,
    "fromProfileId" INTEGER NOT NULL,
    "toProfileId" INTEGER NOT NULL,
    "status" "InterestStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Interest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shortlist" (
    "id" SERIAL NOT NULL,
    "ownerProfileId" INTEGER NOT NULL,
    "targetProfileId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Shortlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favourite" (
    "id" SERIAL NOT NULL,
    "ownerProfileId" INTEGER NOT NULL,
    "targetProfileId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favourite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Block" (
    "id" SERIAL NOT NULL,
    "ownerProfileId" INTEGER NOT NULL,
    "targetProfileId" INTEGER NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileNote" (
    "id" SERIAL NOT NULL,
    "ownerProfileId" INTEGER NOT NULL,
    "targetProfileId" INTEGER NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileVisit" (
    "id" SERIAL NOT NULL,
    "visitorProfileId" INTEGER NOT NULL,
    "targetProfileId" INTEGER NOT NULL,
    "visitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfileVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchScore" (
    "id" SERIAL NOT NULL,
    "profileAId" INTEGER NOT NULL,
    "profileBId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "breakdown" JSONB NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileInsight" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "severity" "InsightSeverity" NOT NULL DEFAULT 'INFO',
    "data" JSONB NOT NULL DEFAULT '{}',
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfileInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "NotificationType" NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleBn" TEXT,
    "bodyEn" TEXT,
    "bodyBn" TEXT,
    "data" JSONB NOT NULL DEFAULT '{}',
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameBn" TEXT,
    "descriptionEn" TEXT,
    "descriptionBn" TEXT,
    "pricePaisa" INTEGER NOT NULL,
    "interval" "PlanInterval" NOT NULL DEFAULT 'MONTHLY',
    "features" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "planId" INTEGER NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'PENDING',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "orderId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditPackage" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameBn" TEXT,
    "credits" INTEGER NOT NULL,
    "pricePaisa" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditWallet" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditLedger" (
    "id" SERIAL NOT NULL,
    "walletId" INTEGER NOT NULL,
    "type" "LedgerEntryType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "reference" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "orderNo" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "OrderType" NOT NULL,
    "itemKey" TEXT NOT NULL,
    "amountPaisa" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BDT',
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "provider" "PaymentProvider" NOT NULL DEFAULT 'SSLCOMMERZ',
    "status" "PaymentStatus" NOT NULL DEFAULT 'INITIATED',
    "amountPaisa" INTEGER NOT NULL,
    "gatewayTxnId" TEXT,
    "sessionKey" TEXT,
    "gatewayPayload" JSONB,
    "validatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" SERIAL NOT NULL,
    "invoiceNo" TEXT NOT NULL,
    "orderId" INTEGER NOT NULL,
    "amountPaisa" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BDT',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiodataUnlock" (
    "id" SERIAL NOT NULL,
    "viewerUserId" INTEGER NOT NULL,
    "profileId" INTEGER NOT NULL,
    "type" "UnlockType" NOT NULL,
    "source" "UnlockSource" NOT NULL,
    "creditsSpent" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BiodataUnlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationRequest" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "VerificationType" NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "evidenceUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "note" TEXT,
    "reviewerId" INTEGER,
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchJourney" (
    "id" SERIAL NOT NULL,
    "interestId" INTEGER NOT NULL,
    "stage" "JourneyStage" NOT NULL DEFAULT 'ACCEPTED',
    "marriedConfirmedByFrom" BOOLEAN NOT NULL DEFAULT false,
    "marriedConfirmedByTo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchJourney_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchJourneyEvent" (
    "id" SERIAL NOT NULL,
    "journeyId" INTEGER NOT NULL,
    "stage" "JourneyStage" NOT NULL,
    "note" TEXT,
    "byProfileId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchJourneyEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" SERIAL NOT NULL,
    "reporterUserId" INTEGER NOT NULL,
    "reportedProfileId" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "resolvedBy" INTEGER,
    "resolutionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuccessStory" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER,
    "titleEn" TEXT NOT NULL,
    "titleBn" TEXT,
    "contentEn" TEXT NOT NULL,
    "contentBn" TEXT,
    "imageUrl" TEXT,
    "marriedAt" TIMESTAMP(3),
    "status" "GeneralStatus" NOT NULL DEFAULT 'INACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SuccessStory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CmsPage" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleBn" TEXT,
    "contentEn" TEXT NOT NULL,
    "contentBn" TEXT,
    "status" "GeneralStatus" NOT NULL DEFAULT 'INACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Advertisement" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "targetUrl" TEXT,
    "placement" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "status" "GeneralStatus" NOT NULL DEFAULT 'INACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Advertisement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportTicketMessage" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,
    "isStaff" BOOLEAN NOT NULL DEFAULT false,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportTicketMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiodataSequence" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BiodataSequence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "Location_parentId_idx" ON "Location"("parentId");

-- CreateIndex
CREATE INDEX "Location_type_idx" ON "Location"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Location_type_nameEn_parentId_key" ON "Location"("type", "nameEn", "parentId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_biodataNo_key" ON "Profile"("biodataNo");

-- CreateIndex
CREATE INDEX "Profile_mode_status_gender_idx" ON "Profile"("mode", "status", "gender");

-- CreateIndex
CREATE INDEX "Profile_districtId_idx" ON "Profile"("districtId");

-- CreateIndex
CREATE INDEX "Profile_divisionId_idx" ON "Profile"("divisionId");

-- CreateIndex
CREATE INDEX "Profile_dateOfBirth_idx" ON "Profile"("dateOfBirth");

-- CreateIndex
CREATE INDEX "Profile_maritalStatus_idx" ON "Profile"("maritalStatus");

-- CreateIndex
CREATE INDEX "Profile_educationLevel_idx" ON "Profile"("educationLevel");

-- CreateIndex
CREATE INDEX "Profile_professionKey_idx" ON "Profile"("professionKey");

-- CreateIndex
CREATE INDEX "Profile_lastActiveAt_idx" ON "Profile"("lastActiveAt");

-- CreateIndex
CREATE INDEX "Profile_createdByUserId_idx" ON "Profile"("createdByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "IslamicProfileDetails_profileId_key" ON "IslamicProfileDetails"("profileId");

-- CreateIndex
CREATE INDEX "IslamicProfileDetails_prayerFrequency_idx" ON "IslamicProfileDetails"("prayerFrequency");

-- CreateIndex
CREATE INDEX "IslamicProfileDetails_madhhab_idx" ON "IslamicProfileDetails"("madhhab");

-- CreateIndex
CREATE INDEX "IslamicProfileDetails_quranMemorization_idx" ON "IslamicProfileDetails"("quranMemorization");

-- CreateIndex
CREATE UNIQUE INDEX "GeneralProfileDetails_profileId_key" ON "GeneralProfileDetails"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerPreference_profileId_key" ON "PartnerPreference"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "PrivacySettings_profileId_key" ON "PrivacySettings"("profileId");

-- CreateIndex
CREATE INDEX "ProfileMember_profileId_idx" ON "ProfileMember"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileMember_userId_profileId_key" ON "ProfileMember"("userId", "profileId");

-- CreateIndex
CREATE INDEX "ProfileMedia_profileId_idx" ON "ProfileMedia"("profileId");

-- CreateIndex
CREATE INDEX "Interest_toProfileId_status_idx" ON "Interest"("toProfileId", "status");

-- CreateIndex
CREATE INDEX "Interest_fromProfileId_status_idx" ON "Interest"("fromProfileId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Interest_fromProfileId_toProfileId_key" ON "Interest"("fromProfileId", "toProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "Shortlist_ownerProfileId_targetProfileId_key" ON "Shortlist"("ownerProfileId", "targetProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "Favourite_ownerProfileId_targetProfileId_key" ON "Favourite"("ownerProfileId", "targetProfileId");

-- CreateIndex
CREATE INDEX "Block_targetProfileId_idx" ON "Block"("targetProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "Block_ownerProfileId_targetProfileId_key" ON "Block"("ownerProfileId", "targetProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileNote_ownerProfileId_targetProfileId_key" ON "ProfileNote"("ownerProfileId", "targetProfileId");

-- CreateIndex
CREATE INDEX "ProfileVisit_targetProfileId_visitedAt_idx" ON "ProfileVisit"("targetProfileId", "visitedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileVisit_visitorProfileId_targetProfileId_key" ON "ProfileVisit"("visitorProfileId", "targetProfileId");

-- CreateIndex
CREATE INDEX "MatchScore_profileAId_score_idx" ON "MatchScore"("profileAId", "score");

-- CreateIndex
CREATE UNIQUE INDEX "MatchScore_profileAId_profileBId_key" ON "MatchScore"("profileAId", "profileBId");

-- CreateIndex
CREATE INDEX "ProfileInsight_profileId_idx" ON "ProfileInsight"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileInsight_profileId_key_key" ON "ProfileInsight"("profileId", "key");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_key_key" ON "Plan"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_orderId_key" ON "Subscription"("orderId");

-- CreateIndex
CREATE INDEX "Subscription_userId_status_idx" ON "Subscription"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CreditPackage_key_key" ON "CreditPackage"("key");

-- CreateIndex
CREATE UNIQUE INDEX "CreditWallet_userId_key" ON "CreditWallet"("userId");

-- CreateIndex
CREATE INDEX "CreditLedger_walletId_createdAt_idx" ON "CreditLedger"("walletId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNo_key" ON "Order"("orderNo");

-- CreateIndex
CREATE INDEX "Order_userId_status_idx" ON "Order"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_gatewayTxnId_key" ON "Payment"("gatewayTxnId");

-- CreateIndex
CREATE INDEX "Payment_orderId_idx" ON "Payment"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNo_key" ON "Invoice"("invoiceNo");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_orderId_key" ON "Invoice"("orderId");

-- CreateIndex
CREATE INDEX "BiodataUnlock_profileId_idx" ON "BiodataUnlock"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "BiodataUnlock_viewerUserId_profileId_type_key" ON "BiodataUnlock"("viewerUserId", "profileId", "type");

-- CreateIndex
CREATE INDEX "VerificationRequest_userId_type_idx" ON "VerificationRequest"("userId", "type");

-- CreateIndex
CREATE INDEX "VerificationRequest_status_type_idx" ON "VerificationRequest"("status", "type");

-- CreateIndex
CREATE UNIQUE INDEX "MatchJourney_interestId_key" ON "MatchJourney"("interestId");

-- CreateIndex
CREATE INDEX "MatchJourneyEvent_journeyId_idx" ON "MatchJourneyEvent"("journeyId");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE INDEX "Report_reportedProfileId_idx" ON "Report"("reportedProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "CmsPage_slug_key" ON "CmsPage"("slug");

-- CreateIndex
CREATE INDEX "SupportTicket_userId_idx" ON "SupportTicket"("userId");

-- CreateIndex
CREATE INDEX "SupportTicket_status_idx" ON "SupportTicket"("status");

-- CreateIndex
CREATE INDEX "SupportTicketMessage_ticketId_idx" ON "SupportTicketMessage"("ticketId");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IslamicProfileDetails" ADD CONSTRAINT "IslamicProfileDetails_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneralProfileDetails" ADD CONSTRAINT "GeneralProfileDetails_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerPreference" ADD CONSTRAINT "PartnerPreference_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivacySettings" ADD CONSTRAINT "PrivacySettings_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileMember" ADD CONSTRAINT "ProfileMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileMember" ADD CONSTRAINT "ProfileMember_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileMedia" ADD CONSTRAINT "ProfileMedia_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interest" ADD CONSTRAINT "Interest_fromProfileId_fkey" FOREIGN KEY ("fromProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interest" ADD CONSTRAINT "Interest_toProfileId_fkey" FOREIGN KEY ("toProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shortlist" ADD CONSTRAINT "Shortlist_ownerProfileId_fkey" FOREIGN KEY ("ownerProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shortlist" ADD CONSTRAINT "Shortlist_targetProfileId_fkey" FOREIGN KEY ("targetProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favourite" ADD CONSTRAINT "Favourite_ownerProfileId_fkey" FOREIGN KEY ("ownerProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favourite" ADD CONSTRAINT "Favourite_targetProfileId_fkey" FOREIGN KEY ("targetProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_ownerProfileId_fkey" FOREIGN KEY ("ownerProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_targetProfileId_fkey" FOREIGN KEY ("targetProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileNote" ADD CONSTRAINT "ProfileNote_ownerProfileId_fkey" FOREIGN KEY ("ownerProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileNote" ADD CONSTRAINT "ProfileNote_targetProfileId_fkey" FOREIGN KEY ("targetProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileVisit" ADD CONSTRAINT "ProfileVisit_visitorProfileId_fkey" FOREIGN KEY ("visitorProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileVisit" ADD CONSTRAINT "ProfileVisit_targetProfileId_fkey" FOREIGN KEY ("targetProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchScore" ADD CONSTRAINT "MatchScore_profileAId_fkey" FOREIGN KEY ("profileAId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchScore" ADD CONSTRAINT "MatchScore_profileBId_fkey" FOREIGN KEY ("profileBId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileInsight" ADD CONSTRAINT "ProfileInsight_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditWallet" ADD CONSTRAINT "CreditWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditLedger" ADD CONSTRAINT "CreditLedger_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "CreditWallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiodataUnlock" ADD CONSTRAINT "BiodataUnlock_viewerUserId_fkey" FOREIGN KEY ("viewerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiodataUnlock" ADD CONSTRAINT "BiodataUnlock_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationRequest" ADD CONSTRAINT "VerificationRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchJourney" ADD CONSTRAINT "MatchJourney_interestId_fkey" FOREIGN KEY ("interestId") REFERENCES "Interest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchJourneyEvent" ADD CONSTRAINT "MatchJourneyEvent_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "MatchJourney"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterUserId_fkey" FOREIGN KEY ("reporterUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reportedProfileId_fkey" FOREIGN KEY ("reportedProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuccessStory" ADD CONSTRAINT "SuccessStory_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicketMessage" ADD CONSTRAINT "SupportTicketMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
