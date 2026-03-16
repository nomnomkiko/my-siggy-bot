export const runtime = "nodejs";

import OpenAI from "openai";
import { analyzeEmotion } from "@/lib/sentiment/analyzer";
import { buildEnhancedSystemPrompt } from "@/lib/ai/knowledge-loader";
import { SIGGY_CHARACTER_PROMPT } from "@/lib/ai/config";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "",
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    if (!message) return new Response(JSON.stringify({ reply: "Meow?", emotion: "neutral" }), { status: 400 });

    // 1. Analyze YOUR emotion first (to help Siggy empathize)
    const userEmotion = analyzeEmotion(message);

    // 2. Build the system prompt
    const basePrompt = buildEnhancedSystemPrompt(SIGGY_CHARACTER_PROMPT, message);
    
    // 3. Force the AI to provide its OWN emotion in JSON format
    const systemPrompt = `
${basePrompt}

[USER CONTEXT]
The user seems to be feeling: ${userEmotion.toUpperCase()}. 
Empathize with this emotion in your personality!

[RESPONSE FORMAT - CRITICAL]
You MUST respond in valid JSON format with these exact keys:
{
  "reply": "Your message here (include cat noises like mwhii, purr, hiks)",
  "siggyEmotion": "Choose one: happy, sad, angry, surprised, or neutral"
}

Identify your OWN feeling after responding to the user. 
Example: If you are telling a sad story, siggyEmotion should be "sad".
`;

    const trimmedHistory = (history || []).slice(-6).map((h: any) => ({
      role: h.role === "user" ? "user" : "assistant",
      content: String(h.text || h.content || ""),
    }));

    // 4. Call Groq with JSON Mode
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", 
      messages: [
        { role: "system", content: systemPrompt },
        ...trimmedHistory,
        { role: "user", content: message },
      ] as any,
      temperature: 0.7,
      max_tokens: 600,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);

    // 5. Return the AI's self-generated emotion to the frontend
    return new Response(JSON.stringify({ 
      reply: parsed.reply || "Meow... Siggy is a bit dizzy!", 
      emotion: parsed.siggyEmotion || "neutral" 
    }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Siggy Route Error:", error);
    return new Response(JSON.stringify({ 
      reply: "huhu error meow... my ritual failed! :(", 
      emotion: "neutral" 
    }), { 
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}