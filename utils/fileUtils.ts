import type { GenerativePart } from "@google/genai";

export function fileToGenerativePart(file: File): Promise<GenerativePart> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error('Failed to read file as base64 string.'));
      }
      // The result is a data URL, like "data:image/jpeg;base64,..."
      // We need to extract the base64 part.
      const base64Data = reader.result.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}