export interface ProjectAttributes {
  projectId: number;
  title: string;
  description: string;
  completionDate: string;
  projectUrl?: string;
  imageUrl?: string | null;
  companyId?: number;
  userId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
