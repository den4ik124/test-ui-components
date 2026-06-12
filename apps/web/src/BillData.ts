import type { BillParameter } from "./BillParameter";
import type { BillStatusEnum } from "./BillStatusEnum";

export interface BillData {
  id: string;
  publicId: string;
  apartmentId: string;
  total: number;
  billingPeriod: string;
  dateCreated: string;
  state: BillStatusEnum;
  parameters: BillParameter[];
}

