export interface RequirementForEmbedding {
  id: number;
  title: string;
  description: string;
  workType: string;
  category: string;
  skills: string[];
  urgency: string;
  minimumBudget: number;
  maximumBudget: number;
  timeline: string;
  userId: number;
  embeddingText: string; 
}

export interface CompanyForEmbedding {
  id: number;
  name: string;
  description: string;
  serviceCategory: string;
  services: string[];
  priceRangeMin: number;
  priceRangeMax: number;
  avgDeliveryTime: string;
  establishedYear: string;
  embeddingText: string; 
}

export interface EmbeddingData {
  requirement?: RequirementForEmbedding;
  company?: CompanyForEmbedding;
  entityType: 'requirement' | 'company';
  entityId: number;
  createdAt: Date;
}