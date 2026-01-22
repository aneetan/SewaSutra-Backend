/**
 * Calculate cosine similarity between two embeddings
 */
export function calculateSimilarity(embedding1, embedding2) {
  // Step 1: Validate inputs
  if (!embedding1 || !embedding2) {
    throw new Error("Both embeddings are required");
  }
  
  if (embedding1.length !== embedding2.length) {
    throw new Error(`Embeddings must be same length: ${embedding1.length} vs ${embedding2.length}`);
  }

  // Step 2: Calculate dot product
  let dotProduct = 0;
  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
  }

  // Step 3: Calculate magnitudes (norms)
  let magnitude1 = 0;
  let magnitude2 = 0;
  for (let i = 0; i < embedding1.length; i++) {
    magnitude1 += embedding1[i] * embedding1[i];
    magnitude2 += embedding2[i] * embedding2[i];
  }
  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  // Step 4: Avoid division by zero
  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }

  // Step 5: Return cosine similarity
  const similarity = dotProduct / (magnitude1 * magnitude2);
  return Math.max(0, Math.min(1, similarity)); // Ensure between 0-1
}

/**
 * Helper to interpret similarity scores
 */
export function interpretSimilarity(score) {
  if (score > 0.8) return "🌟 Very Similar";
  if (score > 0.6) return "✅ Similar"; 
  if (score > 0.4) return "⚠️ Somewhat Related";
  if (score > 0.2) return "📊 Slightly Related";
  return "❌ Not Related";
}

/**
 * Format similarity as percentage
 */
export function similarityToPercent(score) {
  return `${(score * 100).toFixed(1)}%`;
}