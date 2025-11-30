import { pipeline } from "@xenova/transformers";
import EmbeddingConfig from "../../config/embeddings.config";
import pineconeService from "../pinecone.services";
import prisma from "../../config/dbconfig";
import DataTransformerService from "./data-transfromer.services";

let embedder: any = null;

class EmbeddingsService {
  // Load the model once and reuse it
  async loadModel() {
    if (!embedder) {
      embedder = await pipeline(
        EmbeddingConfig.model.name,         
        EmbeddingConfig.model.modelId,       
        {
          cache_dir: EmbeddingConfig.performance.cacheDir,
          revision: EmbeddingConfig.performance.revision
        }
      );
    }
    return embedder;
  }

  // Generate embeddings for a text
  async generateEmbeddings(text: string): Promise<number[]> {
    const model = await this.loadModel();

    const output = await model(text, {
      pooling: EmbeddingConfig.generation.pooling,    
      normalize: EmbeddingConfig.generation.normalize 
    });

    return Array.from(output.data);  
  }

  //generate and save client embeddings
  async saveRequirementEmbeddings(requirementId: number) {
    try {
       // Fetch requirement with user data
      const requirement = await prisma.requirement.findUnique({
        where: { id: requirementId },
        include: { user: { select: { name: true } } }
      });

      if (!requirement) {
        throw new Error(`Requirement with ID ${requirementId} not found`);
      }

      // Transform requirement data
      const transformedData = DataTransformerService.transformRequirement(requirement);
      
      // Generate embedding
      const embedding = await this.generateEmbeddings(transformedData.embeddingText);

      //save to Pinecone
      const vectorId = `req_${requirementId}`;

      const savedVector = await pineconeService.saveEmbedding(
        vectorId,
        embedding,
        transformedData.embeddingText,
        {
          entityType: 'requirement',
          ...transformedData
        },
        'client' 
      );

      return savedVector;

    } catch (error) {
      console.error('Error saving client embedding:', error);
      throw error;
    }
  }

  //GENERATE AND SAVE COMPANY EMBEDDINGS
  async saveCompanyEmbedding(companyId: number) {
    try {
      // Fetch company with services
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        include: { services: true }
      });

      if (!company) {
        throw new Error(`Company with ID ${companyId} not found`);
      }

      // Transform company data
      const transformedData = DataTransformerService.transformCompany(company);
      
      // Generate embedding
      const embedding = await this.generateEmbeddings(transformedData.embeddingText);
      
      // Save to Pinecone
      const vectorId = `comp_${companyId}`;
      const savedVector = await pineconeService.saveEmbedding(
        vectorId,
        embedding,
        transformedData.embeddingText,
        {
          entityType: 'company',
          ...transformedData
        },
        'company' 
      );
      
      console.log(`✅ Saved company embedding: ${company.name}`);
      return savedVector;

    } catch (error) {
      console.error('❌ Error saving company embedding:', error);
      throw error;
    }
  }

   // Find matching COMPANIES for a REQUIREMENT
  async findCompaniesForRequirement(requirementId: number, topK: number = 5) {
    try {      
       // Get requirement data from database to generate the query embedding
      const requirement = await prisma.requirement.findUnique({
        where: { id: requirementId },
        include: { user: { select: { name: true } } }
      });
      
      if (!requirement) {
        throw new Error(`Requirement ${requirementId} not found`);
      }

      const transformedData = DataTransformerService.transformRequirement(requirement);
       const queryEmbedding = await this.generateEmbeddings(transformedData.embeddingText);

       const results = await pineconeService.searchSimilar(
          queryEmbedding, // Use the actual embedding
          topK,
          'company' // Search in company namespace
        );

        return results

    } catch (error) {
      console.error(`❌ Error finding companies for requirement ${requirementId}:`, error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const embeddingService = new EmbeddingsService();
export default embeddingService;