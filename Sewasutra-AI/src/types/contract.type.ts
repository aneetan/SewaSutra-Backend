import { Contract, ServiceType, ContractStatus, PaymentStatus, User, Company, Requirement, Bid } from '@prisma/client'

export interface ProjectValues {
  amount: number;
  durationDays: string;
  advancePercent: number;
  defectLiabilityMonths: number;
  location: string;
  scopeSummary: string;
  serviceType: ServiceType;
  status?: string;
  paymentStatus?: string;
  requirementId?: number;
  clientId?: number;
  companyId?: number;
}

// Form data from frontend
export interface CreateProjectFormData extends ProjectValues {
  clientId: number
  companyId: number
  requirementId: number
}

// Extended contract with relations
export interface ContractWithRelations extends Contract {
  company: Company
  client: User
  requirement: Requirement
}

// Update contract status
export interface UpdateContractStatusData {
  status: ContractStatus
  notes?: string
  signedByClient?: boolean
  signedByCompany?: boolean
  signingDate?: Date
}

// Update payment status
export interface UpdatePaymentStatusData {
  paymentStatus: PaymentStatus
  amountPaid?: number
  transactionId?: string
  paymentMethod?: string
  notes?: string
}

// Filter options
export interface ContractFilters {
  status?: ContractStatus
  paymentStatus?: PaymentStatus
  serviceType?: ServiceType
  companyId?: number
  clientId?: number
  search?: string
  startDate?: Date
  endDate?: Date
}

// Pagination
export interface PaginationOptions {
  page: number
  limit: number
  sortBy?: 'createdAt' | 'amount' | 'durationDays'
  sortOrder?: 'asc' | 'desc'
}