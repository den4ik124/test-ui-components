import type { IssueStatus, IssueType } from "./enums"

export interface IssueResponse {
  id: string
  title: string | null
  description: string | null
  status: IssueStatus
  type: IssueType
  createdBy: string
  dateCreated: string
  dateUpdated: string | null
}

export interface CreateIssueRequest {
  title: string | null
  description: string | null
  type: IssueType
}

export interface AdminIssueStatusDto {
  status: number
}
