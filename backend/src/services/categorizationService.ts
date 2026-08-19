import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export type Category = 'HR' | 'Facilities' | 'IT' | 'Management' | 'Other';
const VALID_CATEGORIES: Category[] = ['HR', 'Facilities', 'IT', 'Management', 'Other'];

function keywordFallback(message: string): Category {
  const text = message.toLowerCase();

  if (/salary|leave|promotion|harass|hr\b/.test(text)) return 'HR';
  if (/toilet|clean|building|chair|desk|ac\b|air condition/.test(text)) return 'Facilities';
  if (/computer|network|internet|software|password|system|server/.test(text)) return 'IT';
  if (/manager|supervisor|decision|policy|leadership/.test(text)) return 'Management';

  return 'Other';
}

export async function categorizeFeedback(
  message: string
): Promise<{ category: Category; aiCategorized: boolean }> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 10,
      messages: [
        {
          role: 'user',
          content: `Classify this employee feedback into EXACTLY ONE of these categories: HR, Facilities, IT, Management, Other.

Respond with ONLY the category word, nothing else - no punctuation, no explanation.

Feedback: "${message}"`,
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    const rawCategory = textBlock && 'text' in textBlock ? textBlock.text.trim() : '';

    if (VALID_CATEGORIES.includes(rawCategory as Category)) {
      return { category: rawCategory as Category, aiCategorized: true };
    }

    console.warn(`Unexpected AI category response: "${rawCategory}", using fallback`);
    return { category: keywordFallback(message), aiCategorized: false };
  } catch (err) {
    console.error('Claude API error, using keyword fallback:', err);
    return { category: keywordFallback(message), aiCategorized: false };
  }
}
