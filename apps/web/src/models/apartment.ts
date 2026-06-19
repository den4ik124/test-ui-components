import type { CurrencyDto } from "./currency"
import type {
  BillParameterTemplate,
  BillResponse,
  BillShortResponse,
} from "./bill"

export interface ApartmentResponse {
  id: string
  title: string | null
  photoUrl: string | null
  bankAccountNumber: string | null
  rentPrice: number
  rentalPeriodMonths: number
  depositMonths: number
  currency: CurrencyDto
  isSelfManaged: boolean
  template: BillParameterTemplate[] | null
  bills: BillResponse[] | null
}

export interface ApartmentShortResponse {
  id: string
  title: string | null
  photoUrl: string | null
  bankAccountNumber: string | null
  rentPrice: number
  rentalPeriodMonths: number
  depositMonths: number
  currency: CurrencyDto
  isSelfManaged: boolean
  template: BillParameterTemplate[] | null
  bills: BillShortResponse[] | null
}

export interface TenantResponse {
  id: string
  email: string | null
  state: string | null
  dateCreated: string
}

export interface GetApartmentTenantsResponse {
  tenants: TenantResponse[] | null
}

export interface AdminApartmentDto {
  id: string
  title: string | null
  rentPrice: number
  bankAccountNumber: string | null
  rentalPeriodMonths: number
  depositMonths: number
  currencyId: number
}
