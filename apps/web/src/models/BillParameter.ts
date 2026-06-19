export interface BillParameter {
  title: string | null;
  index: number;
  previousValue: number;
  value: number;
  price: number;
  date: string;
  description?: string;
  isUncertain?: boolean;
}

