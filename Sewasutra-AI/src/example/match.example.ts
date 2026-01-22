import embeddingService from '../services/embedding/embeddings.service';
import { calculateSimilarity, interpretSimilarity, similarityToPercent } from '../utils/embeddings/similarity';
import { storage } from './storage';

// Step 1: Store some example texts
export async function setupExamples() {
  console.log("📝 Setting up example texts...");
  
  const examples = [
    "I love programming and coding",
    "JavaScript is a programming language",
    "The weather is nice today",
    "I enjoy reading books",
    "Machine learning is fascinating",
    "Web development with React is popular"
  ];

  for (const text of examples) {
    const embedding = await embeddingService.generateEmbeddings(text);
    storage.addItem(text, embedding);
  }
  
  console.log(`✅ Stored ${storage.getCount()} examples\n`);
}

// Step 2: Find matches for a new text
export async function findMatches(newText: string, minSimilarity = 0.1) {
  console.log(`🔍 Finding matches for: "${newText}"`);
  
  // Generate embedding for new text
  const newEmbedding = await embeddingService.generateEmbeddings(newText);
  
  // Compare with all stored items
  const matches = [];
  
  for (const storedItem of storage.items) {
    const similarity = calculateSimilarity(newEmbedding, storedItem.embedding);
    
    // Only include matches above threshold
    if (similarity >= minSimilarity) {
      matches.push({
        id: storedItem.id,
        text: storedItem.text,
        similarity: similarity,
        similarityPercent: similarityToPercent(similarity),
        interpretation: interpretSimilarity(similarity)
      });
    }
  }
  
  // Sort by similarity (highest first)
  matches.sort((a, b) => b.similarity - a.similarity);
  
  return matches;
}

// Step 3: Show storage status
export function showStorageStatus() {
  const items = storage.getAllItems();
  console.log("\n📦 Storage Status:");
  console.log(`   Total items: ${items.length}`);
  items.forEach(item => {
    console.log(`   #${item.id}: "${item.text.substring(0, 40)}..."`);
  });
  console.log("");
}

// Step 4: Run the demo
export async function runDemo() {
  console.log("🚀 Starting Simple Match Demo");
  console.log("========================================\n");
  
  // Show initial empty storage
  console.log("📦 Initial storage count:", storage.getCount());
  
  // Setup examples
  await setupExamples();
  
  // Show storage after setup
  showStorageStatus();
  
  // Test with different queries
  const testQueries = [
    "I enjoy coding in JavaScript",
    "It's sunny outside today",
    "Reading novels is enjoyable",
    "AI and machine learning",
    "Building websites with React"
  ];
  
  for (const query of testQueries) {
    console.log(`\n📝 QUERY: "${query}"`);
    console.log("=".repeat(50));
    
    const matches = await findMatches(query);
    
    if (matches.length === 0) {
      console.log("   No matches found above similarity threshold");
    } else {
      matches.forEach((match, index) => {
        console.log(`${index + 1}. ${match.similarityPercent} - ${match.interpretation}`);
        console.log(`   "${match.text}"`);
        console.log(`   ID: ${match.id}`);
      });
    }
    
    console.log(""); // Empty line between queries
  }
  
  // Final summary
  console.log("========================================");
  console.log("🎉 Demo completed successfully!");
  console.log(`📊 Total embeddings processed: ${storage.getCount()}`);
}

// Run the demo
runDemo().catch(console.error);