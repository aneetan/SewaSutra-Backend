import { application } from "express";
import { normalize } from "path";

export const EmbeddingConfig = {
   model: {
      name: "feature-extraction",
      modelId: "Xenova/all-MiniLM-L6-v2"
   },
   generation: {
      pooling: "mean",
      normalize: true
   },
   performance: {
      cacheDir: "./model-cache",
      revision: "main"
   },
   application: {
      defaultDimensions: 384,
      maxTextLength: 512,
      batchSize: 1   
   }
}

export default EmbeddingConfig;