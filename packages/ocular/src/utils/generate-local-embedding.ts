export async function generateLocalEmbeddings(text:string): Promise<number[]> {
  const transformers = await import("@xenova/transformers");
  const generateEmbedding = await transformers.pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2"
  )
  const output = await generateEmbedding(text, {
    pooling: "mean",
    normalize: true
  })
  return Array.from(output.data)
}