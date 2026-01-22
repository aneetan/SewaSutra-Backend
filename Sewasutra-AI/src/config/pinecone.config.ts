export const PineconeConfig = {
  apiKey: process.env.PINECONE_API_KEY,
  environment: process.env.PINECONE_ENVIRONMENT || 'us-east1-aws',
  
  // Index settings
  index: {
    name: 'client-company-embeddings',
    dimension: 384, 
    metric: 'cosine' as const
  },
  
  // Namespace for different types of data
  namespaces: {
    client: 'client',
    company: 'company'
  }
};

export default PineconeConfig;