'use server'

import fs from 'fs/promises'
import path from 'path'

export async function generateJsonFile(name: string, symbol: string, imageUrl: string, fileName: string) {
  const jsonContent = JSON.stringify(
    {
      name,
      symbol,
      description: "This is a test token",
      image: imageUrl,
    },
    null,
    2
  );

  try {
    const filePath = path.join(process.cwd(), 'public', fileName);
    await fs.writeFile(filePath, jsonContent);
    console.log(`JSON file created successfully at ${filePath}`);
    return `/public/${fileName}`;
  } catch (error) {
    console.error("Error creating JSON file:", error);
    throw error;
  }
}