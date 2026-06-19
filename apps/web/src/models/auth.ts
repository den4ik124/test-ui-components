import type { UserStatus, SubscriptionPlan } from "./enums"

export interface SubscriptionLimitsDto {
  maxApartments: number
  isApartmentsUnlimited: boolean
  maxFileSizeInBytes: number
  maxMonthlyOcrCalls: number
  isOcrUnlimited: boolean
  hasPdfReports: boolean
}

export interface SubscriptionInfoDto {
  name: string | null
  isActive: boolean
  expiredAt: string | null
  createdAt: string | null
  plan: SubscriptionPlan
  limits: SubscriptionLimitsDto
}

export interface ResponseUserDto {
  id: string | null
  username: string | null
  firstName: string | null
  lastName: string | null
  email: string | null
  role: string | null
  enabled: boolean
  emailVerified: boolean
  subscriptionInfo: SubscriptionInfoDto
  attributes: Record<string, string[]> | null
}

export interface RegisterUserDto {
  username: string | null
  email: string | null
  password: string | null
  firstName: string | null
  lastName: string | null
  status: UserStatus
  isTemporaryPassword: boolean
  requiredActions: string[] | null
}

export interface UpdateUserDto {
  id: string | null
  firstName: string | null
  lastName: string | null
}

export interface CompleteGoogleRegistrationDto {
  role: string | null
}

export interface ForgotPasswordRequestDto {
  email: string | null
}

export interface ResetPasswordDto {
  token: string | null
  newPassword: string | null
  confirmPassword: string | null
  email: string | null
}

export interface LoginRequest {
  username: string | null
  email: string | null
  password: string | null
}

export interface ChangePasswordRequest {
  username: string | null
  currentPassword: string | null
  newPassword: string | null
}

export interface RegisterTenantRequest {
  userDto: RegisterUserDto
  apartmentId: string
}

export interface AssignUserToRoleResponse {
  success: boolean
  message: string | null
}

export interface RemoveRoleResponse {
  success: boolean
  message: string | null
}
