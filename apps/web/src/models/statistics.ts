export interface MainStatisticsResponse {
  totalApartments: number
  totalBiils: number
  totalParameters: number
  totalSubscriptions: number
  totalRevenue: number
  lastUpdated: string
}

export interface HostStatisticsResponse {
  totalApartments: number
  openBiils: number
  completedBiils: number
  apartmentsRevenue: Record<string, number> | null
}

export interface TenantStatisticsResponse {
  totalUnpaid: Record<string, number> | null
  totalPaid: Record<string, number> | null
  paidBillsCount: number
  averageMonthlyBill: Record<string, number> | null
}
