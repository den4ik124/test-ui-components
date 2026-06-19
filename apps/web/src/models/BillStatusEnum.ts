export const BillStatusEnum = {
  Created: "Created",
  Paid: "Paid",
  Confirmed: "Confirmed",
  Outdated: "Outdated",
} as const

export type BillStatusEnum =
  (typeof BillStatusEnum)[keyof typeof BillStatusEnum]
