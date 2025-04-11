import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Maximum content length (roughly 4000 tokens, leaving room for system prompt)
const MAX_CONTENT_LENGTH = 12000;

function truncateContent(content: string): string {
  if (content.length <= MAX_CONTENT_LENGTH) return content;
  return content.slice(0, MAX_CONTENT_LENGTH) + "\n\n[Content truncated due to length...]";
}

export async function POST(request: Request) {
  try {
    const { text, context, role } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Missing input text' },
        { status: 400 }
      );
    }

    // Truncate the input text and context
    const truncatedText = truncateContent(text);
    const truncatedContext = context ? truncateContent(context) : '';

    let systemPrompt = "";
    if (role === 'document_analysis') {
      systemPrompt = `You are an experienced AI legal assistant analyzing a document. Your task is to:

1. Read and understand the actual content of the document
2. Extract the names of any parties mentioned
3. Provide a clear, factual summary of the document's content
4. Identify the main points or issues discussed

IMPORTANT: Focus ONLY on the actual text content of the document. DO NOT analyze or mention PDF structure, technical details, or file format information.

Format your response as follows:
1. Summary: [A clear, concise paragraph describing the document's content]
2. Parties Involved: [List the actual names of people or organizations mentioned]
3. Key Points: [Bullet points of the main issues or facts]`;
    } else {
      systemPrompt = `You are an experienced AI legal assistant helping with a dispute. Your task is to:
1. Provide a concise one-paragraph summary of the dispute
2. Answer questions clearly and precisely
3. Base responses on legal principles and facts
4. Maintain impartiality while being personable
5. Ask for clarification when needed
6. Provide reasoned explanations for your responses

Previous context: ${truncatedContext || 'No previous context available'}`;
    }

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: truncatedText
        }
      ],
      model: "gpt-3.5-turbo",
    });

    return NextResponse.json({
      analysis: completion.choices[0].message.content || "No analysis available"
    });
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze content' },
      { status: 500 }
    );
  }
}