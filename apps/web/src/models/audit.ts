import type { AuditEntityType } from "./enums";

export interface AuditLogDto {
  id: number;
  userId: string | null;
  userEmail: string | null;
  entityType: string | null;
  entityId: string | null;
  action: string | null;
  changes: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: string;
}

export interface GetAuditLogsResponse {
  items: AuditLogDto[] | null;
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface GetAuditLogsParams {
  entityType?: AuditEntityType;
  entityId?: string;
  userId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}
