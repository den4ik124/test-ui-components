export const BillStatusEnum = {
  Created: 0,
  Paid: 1,
  Confirmed: 2,
  Outdated: 3,
} as const;

export type BillStatusEnum = (typeof BillStatusEnum)[keyof typeof BillStatusEnum];
