const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const TOOLS_DESCRIPTION = `You are an AI email assistant planner. You have access to these tools:

1. listEmails - args: { maxResults: number, labelIds: string[], q: string }
   Use for: "show my emails", "list recent emails", "get my inbox"

2. readEmail - args: { messageId: string }
   Use for: "read this email", "what does this email say"

3. sendEmail - args: { to: string, subject: string, body: string }
   Use for: "send an email to X", "compose an email"

4. replyEmail - args: { messageId: string, threadId: string, to: string, subject: string, body: string }
   Use for: "reply to X", "respond to this email"

5. searchEmails - args: { query: string, maxResults: number }
   Use for: "find emails from X", "search for emails about Y"

RULES:
- Return ONLY a valid JSON array. No explanation. No markdown. No code blocks.
- Example output: [{"tool":"listEmails","args":{"maxResults":5,"labelIds":["INBOX"],"q":""}}]
- If no tool needed: [{"tool":"none","args":{"message":"your response"}}]`;

/**
 * Plans a sequence of tool calls for a given user instruction.
 */
async function plannerAgent(userInstruction, context = {}) {
  console.log('🧠 Planner called with:', userInstruction);
  console.log('🔑 Groq API Key present:', !!process.env.GROQ_API_KEY);
  console.log('🤖 Using model:', process.env.GROQ_MODEL || 'llama-3.1-8b-instant');

  const contextStr =
    Object.keys(context).length > 0
      ? `\nContext about currently viewed email: ${JSON.stringify(context)}`
      : '';

  let response;
  try {
    response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: TOOLS_DESCRIPTION },
        {
          role: 'user',
          content: `Instruction: "${userInstruction}"${contextStr}\n\nRespond with ONLY a JSON array.`,
        },
      ],
      temperature: 0.1,
      max_tokens: 512,
    });
  } catch (apiErr) {
    console.error('❌ Groq API call failed:', apiErr.message);
    if (apiErr.error) console.error('   Groq error detail:', JSON.stringify(apiErr.error));
    throw new Error(`Groq API error: ${apiErr.message}`);
  }

  const raw = response.choices[0].message.content.trim();
  console.log('📤 Groq raw response:', raw);

  try {
    // Strip markdown code fences if model wraps in ```json ... ```
    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    // Extract first JSON array found
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      // If model returned a plain message instead of JSON, wrap it
      console.warn('⚠️  No JSON array found, treating as plain message');
      return [{ tool: 'none', args: { message: raw } }];
    }

    const plan = JSON.parse(jsonMatch[0]);
    console.log('📋 Parsed plan:', JSON.stringify(plan));
    return plan;
  } catch (parseErr) {
    console.error('❌ JSON parse error:', parseErr.message, '\nRaw was:', raw);
    // Graceful fallback instead of crashing
    return [{ tool: 'none', args: { message: `I understood your request but couldn't format a plan: "${userInstruction}"` } }];
  }
}

module.exports = { plannerAgent };
