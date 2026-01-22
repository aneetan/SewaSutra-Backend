export interface RequirementAttribute {
   id: number,
  title: string;
  description: string;
  workType: 'REMOTE' | 'ONSITE';
  minimumBudget: number;
  maximumBudget: number;
  category: string;
  timeline: string;
  skills: string[];
  attachment: '';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  userId: number;
}