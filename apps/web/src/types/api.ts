export interface ApiResponse<T = unknown> {
  statusCode: number;
  message: string;
  data?: T;
  error?: unknown;
  timestamp: string;
}

export interface AuthTokens {
  access_type: string;
  access_token: string;
  refresh_token: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export interface ProfileMode {
  ISLAMIC: 'ISLAMIC';
  GENERAL: 'GENERAL';
}

export type ProfileModeType = 'ISLAMIC' | 'GENERAL';

export interface BiodataCard {
  id: number;
  biodataNo: string;
  mode: ProfileModeType;
  gender: string;
  age: number;
  birthYear?: number;
  heightCm?: number | null;
  maritalStatus: string;
  districtId?: number | null;
  divisionId?: number | null;
  educationLevel?: string | null;
  professionKey?: string | null;
  greenFlags?: string[];
  verificationBadges?: string[];
  completionPercent?: number;
  isPremium?: boolean;
  lastActiveAt?: string;
  photoUrl?: string | null;
  viewCount?: number;
  compatibilityPercent?: number;
  mandatoryMatchPercent?: number;
  overallMatchPercent?: number;
}

export interface MatchBreakdown {
  key: string;
  score: number;
  label?: string;
}

export interface CompatibilityResult {
  overallPercent: number;
  mandatoryPercent: number;
  breakdown: MatchBreakdown[];
  mandatoryBreakdown: MatchBreakdown[];
}

export interface MutualMatchItem {
  mutualMatchId: number;
  profileId: number;
  biodataNo: string;
  mandatoryPercent?: number | null;
  discountAvailable: boolean;
  detectedAt?: string;
}

export interface ChatRoomSummary {
  id: number;
  expiresAt: string;
  status: string;
  waliMonitoring: boolean;
  participantRole?: string;
  lastMessage?: { id: number; body: string; createdAt: string } | null;
  otherProfile: BiodataCard;
}

export interface DivisionStat {
  divisionId: number;
  nameEn: string;
  nameBn: string;
  grooms: number;
  brides: number;
}

export interface ModeGenderStats {
  male: number;
  female: number;
  total: number;
}

export interface PublicStats {
  totalBiodatas: number;
  grooms: number;
  brides: number;
  successfulMarriages: number;
  byMode?: {
    ISLAMIC: ModeGenderStats;
    GENERAL: ModeGenderStats;
  };
  divisions: DivisionStat[];
}

export interface EnumEntry {
  value: string;
  label: string;
}

export interface EnumCatalog {
  [category: string]: EnumEntry[];
}

export interface LocationItem {
  id: number;
  type: string;
  nameEn: string;
  nameBn: string;
  parentId?: number | null;
}

export interface PlanItem {
  key: string;
  nameEn: string;
  nameBn: string;
  descriptionEn: string;
  descriptionBn: string;
  pricePaisa: number;
  interval: string;
  features: Record<string, unknown>;
}

export interface CreditPackageItem {
  key: string;
  nameEn: string;
  nameBn?: string | null;
  credits: number;
  pricePaisa: number;
}

export interface CreditLedgerEntry {
  id: number;
  type: string;
  amount: number;
  reference?: string | null;
  note?: string | null;
  createdAt: string;
}

export interface WalletData {
  userId?: number;
  balance: number;
  entries: CreditLedgerEntry[];
}

export interface UnlockResult {
  id: number;
  creditsCharged?: number;
  discountApplied?: boolean;
  chatRoom?: {
    id: number;
    expiresAt: string;
    waliMonitoring: boolean;
  } | null;
  contactRevealed?: boolean;
}

export interface DashboardData {
  profile?: {
    id: number;
    biodataNo: string;
    mode: ProfileModeType;
    status: string;
    completionPercent: number;
    readinessPercent?: number;
  };
  stats?: {
    interestsReceived: number;
    interestsSent: number;
    visitorsCount: number;
    unlocksCount: number;
    unreadNotifications: number;
  };
  recommendations?: BiodataCard[];
  recentVisitors?: unknown[];
  notifications?: unknown[];
  mutualMatches?: { count: number; items: MutualMatchItem[] };
}
