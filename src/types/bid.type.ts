type BidStatus = 'DECLINED' | 'ACCEPTED' | 'INITIATED' | 'PENDING' | 'FINAL_SUBMITTED'

export interface BidRequestData {
   id: number;
  userId: number;
  companyId: number;
  requirementId: number;
  requestedAt: Date;
  status?: "SENT" | "DECLINED";
  userName?: string;
}

export interface BidData {
  id?: number;
  amount: number;
  message: string;
  deliveryTime: string;
  companyId?: number;
  requirementId?: number;
  bidRequestId?: number;
  status?: BidStatus;
  createdAt?: Date;
  updatedAt?: Date;
}