export type UserStatus = "Host" | "Tenant" | "SelfTenant"

export type AuditEntityType = "Apartment" | "Bill" | "TenantApartment" | "Issue"

export type BillState = "Created" | "Paid" | "Confirmed" | "Outdated"

export type DateRanges = "TOTAL" | "YEAR" | "HALF_YEAR" | "MONTH"

export type IssueStatus = "Created" | "InProgress" | "Resolved"

export type IssueType = "IssueOrBug" | "Request" | "Other"

export type NotificationSeverity = "Info" | "Warning" | "Error"

export type PaymentType = "OneTime" | "Subscription"

export type ReportFormat = "Html" | "Pdf" | "Csv"

export type ReportPeriod = "All" | "Year" | "Months" | "Month"

export type SubscriptionPeriod = "Day" | "Month" | "Halfyear" | "Year"

export type SubscriptionPlan =
  | "None"
  | "Free"
  | "Pro"
  | "Premium"
  | "Tenant"
  | "SelfTenant"
