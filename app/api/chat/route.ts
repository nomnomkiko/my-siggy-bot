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

    if (!message) return new Response(JSON.stringify({ reply: "Meow?" }), { status: 400 });

    const emotion = analyzeEmotion(message);

    const systemPrompt = buildEnhancedSystemPrompt(SIGGY_CHARACTER_PROMPT, message);

    const trimmedHistory = (history || []).slice(-6).map((h: any) => ({
      role: h.role === "user" ? "user" : "assistant",
      content: String(h.text || h.content || ""),
    }));

    const chatMessages = [
      { role: "system", content: systemPrompt },
      ...trimmedHistory,
      { role: "user", content: message },
    ];

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", 
      messages: chatMessages as any,
      temperature: 0.5,
      max_tokens: 500,
      top_p: 0.8,
    });

    const reply = response.choices[0]?.message?.content || "Meow... Siggy's head spinning! 😵‍💫";

    return new Response(JSON.stringify({ reply }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Siggy Route Error:", error);
    return new Response(JSON.stringify({ reply: "huhu error meow... :(" }), { status: 200 });
  }
}