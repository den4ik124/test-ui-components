import type {
  MainStatisticsResponse,
  HostStatisticsResponse,
  TenantStatisticsResponse,
} from "../models/statistics"

export const dummyMainStats: MainStatisticsResponse = {
  totalApartments: 1284,
  totalBiils: 38520,
  totalParameters: 512340,
  totalSubscriptions: 940,
  totalRevenue: 112480.5,
  lastUpdated: "2026-01-19T06:00:00Z",
}

export const dummyHostStats: HostStatisticsResponse = {
  totalApartments: 6,
  openBiils: 4,
  completedBiils: 87,
  apartmentsRevenue: {
    "APT-42A": 14400,
    "APT-07B": 5700,
    "APT-15C": 21600,
    "APT-23D": 4200,
    "APT-88E": 54000,
    "APT-31F": 7440,
  },
}

export const dummyTenantStats: TenantStatisticsResponse = {
  totalUnpaid: {
    "2026-01": 544.61,
    "2025-12": 858.29,
    "2025-11": 766.76,
  },
  totalPaid: {
    "2025-10": 699.44,
    "2025-09": 531.1,
    "2025-08": 560.95,
    "2025-07": 591.4,
    "2025-06": 534.25,
    "2025-05": 506.11,
    "2025-04": 548.15,
    "2025-03": 648.75,
    "2025-02": 782.14,
    "2025-01": 853.3,
    "2024-12": 782.45,
  },
  paidBillsCount: 22,
  averageMonthlyBill: {
    "2025": 637.45,
    "2024": 695.18,
    "2023": 702.99,
  },
}
