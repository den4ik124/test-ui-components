export interface CurrencyDto {
  code: number;
  shortName: string | null;
  rates: Record<string, number> | null;
}

export interface AdminCurrencyDto {
  code: number;
  shortName: string | null;
  fullName: string | null;
}
