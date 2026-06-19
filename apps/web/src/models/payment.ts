import type { PaymentType, SubscriptionPeriod, SubscriptionPlan } from "./enums"

export interface Product {
  id: string
  dateCreated: string
  dateUpdated: string | null
  stripeProductId: string | null
  title: string | null
  description: string | null
  features: string[] | null
  priceInCents: number
  currencyCode: string | null
  trialPeriod: number
  durationInMonths: number
  plan: SubscriptionPlan
  imageUrl: string | null
  isEnabled: boolean
  subscriptions: Subscription[] | null
}

export interface Subscription {
  id: string
  dateCreated: string
  dateUpdated: string | null
  expiredAt: string | null
  plan: SubscriptionPlan
  productId: string | null
  product: Product
  lastCheckoutSessionId: string | null
}

export interface CreateCheckoutSessionRequest {
  productId: string
  userEmail: string | null
  period: SubscriptionPeriod
  paymentType: PaymentType
}

export interface CreateCheckoutSessionResponse {
  url: string | null
}

export interface CreateSubscriptionRequest {
  userId: string
  plan: SubscriptionPlan
}

export interface PaymentHistoryItemDto {
  date: string
  amount: number
  currency: string | null
  invoiceUrl: string | null
}

export interface UpdateProductRequest {
  id: string
  title: string | null
  description: string | null
  priceInCents: number
  currencyCode: string | null
  trialPeriod: number
  durationInMonths: number
  imageUrl: string | null
  isEnabled: boolean
}

export interface AdminProductDto {
  id: string
  title: string | null
  description: string | null
  priceInCents: number
  currencyCode: string | null
  trialPeriod: number
  durationInMonths: number
  imageUrl: string | null
  isEnabled: boolean
}

export interface AdminSubscriptionDto {
  id: string
  expiredAt: string
  productId: string
}
