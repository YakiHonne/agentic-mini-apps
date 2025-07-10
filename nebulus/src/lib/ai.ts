import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

/**
 * Cleans up Nostr note content to make it more suitable for AI processing.
 * Removes URLs, hashtags, and excessive whitespace.
 * @param content The raw content of a Nostr note.
 * @returns The cleaned-up text.
 */
function cleanNoteContent(content: string): string {
  let cleaned = content.replace(/https?:\/\/[^\s]+/g, '');
  cleaned = cleaned.replace(/nostr:[^\s]+/g, '');
  cleaned = cleaned.replace(/#\w+/g, '');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
}

/**
 * Summarizes a piece of text using the OpenAI API.
 * @param content The text content of a single Nostr note.
 * @returns An AI-generated one-sentence summary.
 */
export async function summarizeContent(content: string): Promise<string> {
  const cleanedContent = cleanNoteContent(content);

  if (cleanedContent.length < 20) {
    return cleanedContent;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "system",
          content: "You are a highly skilled AI assistant called Nebulux. Your task is to summarize the following social media post into a single, concise, and neutral sentence. Do not add any commentary or your own opinions."
        },
        {
          role: "user",
          content: cleanedContent
        }
      ],
      temperature: 0.2,
      max_tokens: 200,
    });

    const summary = completion.choices[0]?.message?.content?.trim() || "Could not generate summary.";
    return summary;

  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return "AI summarization failed.";
  }
}