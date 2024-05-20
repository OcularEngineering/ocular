const TransformersApi = Function('return import("@xenova/transformers")')();
export async function generateEmbedding(content: string): Promise<number[]> {
  const { pipeline } = await TransformersApi;
  const generateEmbedding = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2"
  );
  const output = await generateEmbedding(content, {
    pooling: "mean",
    normalize: true,
  });
  const embedding: number[] = Array.from(output.data);
  return embedding;
}
