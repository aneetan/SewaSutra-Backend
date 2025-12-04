export interface PineconeVector {
  id: string;
  values: number[];
  metadata: {
    text: string;
    type: string;
    createdAt: string;
    [key: string]: any;
  };
}