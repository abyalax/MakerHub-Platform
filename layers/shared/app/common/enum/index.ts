export enum ContentAccessType {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
}
export enum ContentStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED',
  ARCHIVED = 'ARCHIVED',
}
export enum ClassType {
  FREE = 'FREE',
  PAID = 'PAID',
}
export enum AssetKind {
  COVER_IMAGE = 'COVER_IMAGE',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  PDF = 'PDF',
  EBOOK = 'EBOOK',
  RESOURCE = 'RESOURCE',
}
export enum AssetVisibility {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
  PROTECTED = 'PROTECTED',
}
export enum PaymentProvider {
  XENDIT = 'XENDIT',
}
export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
  CANCELED = 'CANCELED',
  REFUNDED = 'REFUNDED',
}
export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
  REFUNDED = 'REFUNDED',
}
export enum BillingInterval {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}
export enum SubscriptionStatus {
  INCOMPLETE = 'INCOMPLETE',
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELED = 'CANCELED',
  EXPIRED = 'EXPIRED',
}
export enum EntitlementType {
  PURCHASE = 'PURCHASE',
  SUBSCRIPTION = 'SUBSCRIPTION',
  ADMIN_GRANT = 'ADMIN_GRANT',
}
export enum EnrollmentStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
}
export enum ProgressStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}
export enum TrafficEventType {
  PAGE_VIEW = 'PAGE_VIEW',
  PROJECT_VIEW = 'PROJECT_VIEW',
  CLASS_VIEW = 'CLASS_VIEW',
  MENTOR_VIEW = 'MENTOR_VIEW',
  SEARCH = 'SEARCH',
}
export enum RevenueRuleScope {
  PLATFORM = 'PLATFORM',
  CLASS = 'CLASS',
  MENTOR = 'MENTOR',
}
export enum PayoutStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PAID = 'PAID',
  FAILED = 'FAILED',
}
