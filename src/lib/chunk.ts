// Simple text chunker for embedding indexing.
export function chunkText(text: string, targetSize = 800, overlap = 120): string[] {
  const clean = text.replace(/\r\n/g, "\n").trim();
  if (!clean) return [];
  if (clean.length <= targetSize) return [clean];

  // Split on paragraph boundaries first, then hard-slice long paragraphs.
  const paragraphs = clean.split(/\n{2,}/).flatMap((p) => {
    if (p.length <= targetSize) return [p];
    const parts: string[] = [];
    for (let i = 0; i < p.length; i += targetSize - overlap) {
      parts.push(p.slice(i, i + targetSize));
    }
    return parts;
  });

  const chunks: string[] = [];
  let current = "";
  for (const p of paragraphs) {
    if ((current + "\n\n" + p).length > targetSize && current) {
      chunks.push(current.trim());
      // Overlap: keep the tail of the previous chunk.
      current = current.slice(-overlap) + "\n\n" + p;
    } else {
      current = current ? current + "\n\n" + p : p;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}
