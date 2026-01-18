import { Requirement, Company, Services, WorkType, Urgency } from '@prisma/client';
import prisma from '../../config/dbconfig';

export class DataTransformerService {
  
  // Transform Requirement for embedding
  static transformRequirement(requirement: Requirement & { user?: { name: string } }): any {
    const embeddingText = this.buildRequirementEmbeddingText(requirement);
    
    return {
      id: requirement.id,
      title: requirement.title,
      description: requirement.description,
      workType: requirement.workType,
      category: requirement.category,
      skills: requirement.skills,
      urgency: requirement.urgency,
      minimumBudget: requirement.minimumBudget,
      maximumBudget: requirement.maximumBudget,
      timeline: requirement.timeline,
      userId: requirement.userId,
      userName: requirement.user?.name || '',
      embeddingText: embeddingText,
      entityType: 'requirement' as const,
      entityId: requirement.id,
      createdAt: requirement.createdAt
    };
  }

  // Transform Company for embedding
  static async transformCompany(company: Company & { services?: Services[] }): Promise<any> {
    const embeddingText = this.buildCompanyEmbeddingText(company);
    const serviceNames = company.services?.map(service => service.service) || [];
    
    // Fetch average rating from reviews
    const reviews = await prisma.review.findMany({
      where: { companyId: company.id, deletedAt: false },
      select: { rating: true }
    });
    
    const averageRating = reviews.length > 0
      ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2))
      : 0;
    
    return {
      id: company.id,
      name: company.name,
      description: company.description,
      serviceCategory: company.serviceCategory,
      services: serviceNames,
      priceRangeMin: company.priceRangeMin,
      priceRangeMax: company.priceRangeMax,
      avgDeliveryTime: company.avgDeliveryTime,
      establishedYear: company.establishedYear,
      averageRating: averageRating,
      totalReviews: reviews.length,
      embeddingText: embeddingText,
      entityType: 'company' as const,
      entityId: company.id,
      createdAt: company.createdAt
    };
  }

  // Build combined text for requirement embedding
  private static buildRequirementEmbeddingText(requirement: Requirement): string {
    const parts = [
      requirement.title,
      requirement.description,
      `Work type: ${requirement.workType.toLowerCase()}`,
      `Category: ${requirement.category}`,
      `Skills needed: ${requirement.skills.join(', ')}`,
      `Urgency: ${requirement.urgency.toLowerCase()}`,
      `Budget: $${requirement.minimumBudget} to $${requirement.maximumBudget}`,
      `Timeline: ${requirement.timeline}`
    ];

    return parts.filter(part => part && part.trim()).join('. ');
  }

  // Build combined text for company embedding
  private static buildCompanyEmbeddingText(company: Company & { services?: Services[] }): string {
    const serviceNames = company.services?.map(service => service.service) || [];
    
    const parts = [
      company.name,
      company.description,
      `Service category: ${company.serviceCategory}`,
      `Services offered: ${serviceNames.join(', ')}`,
      `Price range: $${company.priceRangeMin} to $${company.priceRangeMax}`,
      `Average delivery time: ${company.avgDeliveryTime}`,
      `Established year: ${company.establishedYear}`,
      'Ratings and reviews considered in matching'
    ];

    return parts.filter(part => part && part.trim()).join('. ');
  }

  // Batch transform requirements
  static transformRequirements(requirements: any[]): any[] {
    return requirements.map(req => this.transformRequirement(req));
  }

  // Batch transform companies
  static async transformCompanies(companies: any[]): Promise<any[]> {
    return Promise.all(companies.map(company => this.transformCompany(company)));
  }

  // Convert to JSON string for storage
  static toJSON(data: any): string {
    return JSON.stringify(data, null, 2);
  }

  // Parse from JSON string
  static fromJSON(jsonString: string): any {
    return JSON.parse(jsonString);
  }
}

export default DataTransformerService;