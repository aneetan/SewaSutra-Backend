export interface ReviewPayload {
   id: number;
   rating: number;
   comment?: string;
   companyId?: number;
   clientId?: number;
   deletedAt?: boolean;
}