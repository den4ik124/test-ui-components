import type { BillState, ReportFormat, ReportPeriod } from "./enums"

export interface BillParameterTemplate {
  title: string | null
  valuePerUnit: number
  unitName: string | null
}

export interface BillParameterResponse {
  title: string | null
  index: number
  previousValue: number
  value: number
  price: number
  date: string
}

export interface BillResponse {
  id: string
  publicId: string
  apartmentId: string
  billingPeriod: string
  dateCreated: string
  state: BillState
  total: number
  parameters: BillParameterResponse[] | null
}

export interface BillShortResponse {
  id: string
  publicId: string
  apartmentId: string
  billingPeriod: string
  dateCreated: string
  state: BillState
  total: number
}

export interface BillParameterDto {
  index: number
  title: string | null
  value: number
  price: number
  date: string | null
  description: string | null
}

export interface CreateBillRequest {
  apartmentId: string
  billParametersDto: BillParameterDto[] | null
  billingPeriod: string
}

export interface UpdateBillApiRequest {
  apartmentId: string
  billParametersDto: BillParameterDto[] | null
  billingPeriod: string
  templateParameterTitles: string[] | null
}

export interface AdminBillDto {
  id: string
  total: number
  state: BillState
  billingPeriod: string
}

export interface AdminBillParameterDto {
  value: number | null
  price: number
}

export interface InvoiceParametersResponse {
  parameters: string[] | null
}

export interface RecognizedInvoiceItem {
  description: string | null
  amount: number | null
  isAmountUncertain: boolean
  quantity: number | null
  isQuantityUncertain: boolean
}

export interface RecognizedInvoiceData {
  totalAmount: number | null
  isTotalAmountUncertain: boolean
  invoiceDate: string | null
  items: RecognizedInvoiceItem[] | null
}

export interface RecognizeInvoiceResponse {
  data: RecognizedInvoiceData
}

export interface GenerateApartmentReportRequest {
  apartmentId: string
  format: ReportFormat
  period: ReportPeriod
  language: string | null
}

export interface GenerateApartmentReportResponse {
  blobUrl: string | null
  fileName: string | null
  expiresAt: string
}

export interface RecentReportDto {
  name: string | null
  size: number
  url: string | null
  createdAt: string | null
}
