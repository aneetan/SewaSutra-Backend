import { Pinecone } from "@pinecone-database/pinecone";
import PineconeConfig from "../config/pinecone.config";
import { PineconeVector } from "../types/embeddings/pinecone.types";

class PineconeService {
   private pinecone: Pinecone;
   private index: any;
   private isInitialized: boolean = false;

   constructor() {
      this.pinecone = new Pinecone({
         apiKey: PineconeConfig.apiKey,
      });

      this.index = this.pinecone.Index(PineconeConfig.index.name);
   }

   //Initialize Pinecone
   async initialize () {
      try {
         // Check if index exists, create if not
         const indexList = await this.pinecone.listIndexes();
         const indexExists = indexList.indexes?.some(
            (index: any) => index.name === PineconeConfig.index.name
         );

         if(!indexExists) {
            await this.pinecone.createIndex({
               name: PineconeConfig.index.name,
               dimension: PineconeConfig.index.dimension,
               metric: PineconeConfig.index.metric,
               spec: {
                  serverless: {
                  cloud: 'aws',
                  region: 'us-east-1'
                  }
               } as any,
            });
            this.index = this.pinecone.index(PineconeConfig.index.name);
         }
      } catch (e) {
         console.error('Failed to initialize Pinecone:', e);
         throw e;
      }
   }

   async saveEmbedding(
      id: string, 
      embedding: number[], 
      text: string, 
      metadata: any = {},
      namespace
   ) {
      try {
         if(!this.index) {
            await this.initialize();
         }

         const vector: PineconeVector = {
            id,
            values: embedding,
            metadata: {
               text,
               type: 'text',
               createdAt: new Date().toISOString(),
               ...metadata
            }
         };

         const namespaceObj = this.index.namespace(namespace);
         await namespaceObj.upsert([vector]);

         return vector;
      } catch (error) {
         console.error('Error saving to Pinecone:', error);
         throw error;
      }
   }

   async searchSimilar(
      queryEmbedding: number[],
      topK: number = 5,
      namespace: string = PineconeConfig.namespaces.client, // Default to client
      filter: any = {}
   ) {
      try {
         if (!this.index) {
            await this.initialize();
         }

         const namespaceObj = this.index.namespace(namespace);
         const queryOptions: any = {
            vector: queryEmbedding,
            topK,
            includeMetadata: true,
            includeValues: false
         };

          // Only add filter if it's not empty
         if (filter && Object.keys(filter).length > 0) {
            queryOptions.filter = filter;
         }

         const results = await namespaceObj.query(queryOptions);

         return results.matches?.map((match: any) => ({
            id: match.id,
            score: match.score,
            text: match.metadata?.text,
            metadata: match.metadata
         })) || [];

      } catch (error) {
         console.error('Error searching Pinecone:', error);
         throw error;
      }
   }

   async deleteEmbedding(id: string, namespace: string = PineconeConfig.namespaces.client) {
      try {
         if (!this.index) {
         await this.initialize();
         }

         const namespaceObj = this.index.namespace(namespace);
         await namespaceObj.deleteOne(id);
         
         return true;

      } catch (error) {
         console.error('Error deleting from Pinecone:', error);
         throw error;
      }
   }

    async getStats(namespace?: string) {
       try {
         if (!this.index) {
            await this.initialize();
         }

         // If no namespace provided, get overall stats
         if (!namespace) {
            const stats = await this.index.describeIndexStats();
            return stats;
         }

         const namespaceObj = this.index.namespace(namespace);
         const stats = await namespaceObj.describeIndexStats();
         
         return stats;

      } catch (error) {
         console.error('Error getting Pinecone stats:', error);
         throw error;
      }
   }

   async findMatchesAcrossNamespaces(
      queryEmbedding: number[],
      sourceNamespace: string,
      targetNamespace: string,
      topK: number = 5,
      filter: any = {}
   ){
      try {
         if (!this.index) {
            await this.initialize();
         }

         const targetNamespaceObj = this.index.namespace(targetNamespace);
         const results = await targetNamespaceObj.query({
            vector: queryEmbedding,
            topK,
            includeMetadata: true,
            includeValues: false,
            filter
         });

         return results.matches?.map((match: any) => ({
            id: match.id,
            score: match.score,
            text: match.metadata?.text,
            metadata: match.metadata,
            sourceNamespace,
            targetNamespace
         })) || [];

      } catch (error) {
         console.error('Error in cross-namespace search:', error);
         throw error;
      }
   }
}

export const pineconeService = new PineconeService();
export default pineconeService;

