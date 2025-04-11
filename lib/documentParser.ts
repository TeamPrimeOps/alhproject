import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF.js worker using local worker file
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

async function extractTextFromPdf(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      
      // Process each text item while preserving layout
      const textItems = content.items.map((item: any) => {
        // Only process actual text items
        if (!item.str || typeof item.str !== 'string') {
          return '';
        }
        return item.str;
      });

      // Join text items with spaces, preserving paragraphs
      const pageText = textItems
        .reduce((text: string, item: string) => {
          // Add a space between items unless the current item starts with a space
          const separator = item.startsWith(' ') ? '' : ' ';
          return text + separator + item;
        }, '')
        .trim();

      // Add page text to full text with proper spacing
      fullText += pageText + '\n\n';
    }

    // Clean up the text
    return fullText
      .replace(/\s+/g, ' ')        // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, '\n\n') // Replace multiple newlines with double newline
      .trim();                     // Remove leading/trailing whitespace
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF document. Please ensure the file is not corrupted.');
  }
}

export async function extractTextFromDocument(file: File): Promise<string> {
  try {
    const fileType = file.type;
    
    // For text files, use FileReader
    if (fileType === 'text/plain') {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (e) => reject(new Error('Failed to read text file'));
        reader.readAsText(file);
      });
    }

    // For PDFs, use pdf.js
    if (fileType === 'application/pdf') {
      return extractTextFromPdf(file);
    }

    // For images, use Tesseract.js
    if (fileType.startsWith('image/')) {
      try {
        const worker = await createWorker();
        const { data: { text } } = await worker.recognize(file);
        await worker.terminate();
        return text;
      } catch (error) {
        console.error('OCR error:', error);
        throw new Error('Failed to extract text from image. Please try a different file format.');
      }
    }

    throw new Error(`Unsupported file type: ${fileType}`);
  } catch (error) {
    console.error('Document parsing error:', error);
    throw error instanceof Error ? error : new Error('Failed to process document');
  }
}