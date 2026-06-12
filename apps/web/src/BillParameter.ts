export interface BillParameter {
  title: string;
  index: number;
  previousValue: number;
  value: number;
  price: number;
  date: Date;
  description?: string;
  isUncertain?: boolean;
}

