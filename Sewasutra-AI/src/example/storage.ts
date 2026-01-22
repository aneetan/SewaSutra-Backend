// Define the item type
export interface StorageItem {
  id: number;
  text: string;
  embedding: number[];
  addedAt: string;
}

// Simple in-memory storage
class SimpleStorage {
   public items: StorageItem[];
  private nextId: number;

  constructor() {
    this.items = []; // Store {text, embedding, id}
    this.nextId = 1;
  }

  // Add text with its embedding
  addItem(text: string, embedding: number[]): StorageItem {
    const item: StorageItem = {
      id: this.nextId++,
      text: text,
      embedding: embedding,
      addedAt: new Date().toISOString()
    };
    this.items.push(item);
    console.log(`✅ Stored: "${text.substring(0, 30)}..."`);
    return item;
  }

  // Get all stored items
  getAllItems() {
    return this.items.map(item => ({
      id: item.id,
      text: item.text,
      addedAt: item.addedAt
    }));
  }

  // Get embedding by ID
  getEmbedding(id: number): number[] | null {
    const item = this.items.find(item => item.id === id);
    return item ? item.embedding : null;
  }

  // Get item by ID
  getItem(id: number): StorageItem | undefined {
    return this.items.find(item => item.id === id);
  }

  // Count items
  getCount(): number {
    return this.items.length;
  }
}

export const storage = new SimpleStorage();