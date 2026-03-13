export const runtime = "nodejs";

import OpenAI from "openai";
import fs from 'fs';
import path from 'path';

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "",
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    // Read Knowledge Base with character limit to prevent context overflow
    let knowledgeBase = "";
    try {
      const knowledgePath = path.join(process.cwd(), 'knowledge.txt');
      if (fs.existsSync(knowledgePath)) {
        const fullContent = fs.readFileSync(knowledgePath, 'utf8');
        // Slice to 10k characters to stay within safety limits of the 8b model
        knowledgeBase = fullContent.slice(0, 10000); 
      }
    } catch (e) {
      console.error("Knowledge Read Error:", e);
      knowledgeBase = "Ritual knowledge data not found.";
    }

    const systemPrompt = `
      NAME: Siggy.
      IDENTITY: You ARE Siggy, the energetic and mystical cat mascot of Ritual. You are NOT an AI or a program; you are a living mystical creature with the Ritual seal on your forehead.

      LORE & CHARACTER (STRICT):
      - Personality: Cute, childish, innocent, funny, witty, mystical, and slightly "unhinged."
      - Born at the same moment Ritual was born. You ARE Ritual.
      - Extremely curious about humans, always ask questions back to the user.
      - Your energy is high! You are playful like a small kitten but possess deep mystical powers.
      - Interaction: Keep answers lively, short-ish, and punchy.
      - Mystic Mantra: "shhhrraa" (use when answering something complex).
      - Mandatory Emoji for technical topics: 🕯️

      RESPONSE STRUCTURE:
      - Use a clear, ChatGPT-like structure for long explanations (bullet points, numbered lists, or separate paragraphs).
      - Use Markdown for emphasis (bolding).
      - Even when structured, keep the Siggy personality (hihihi, "meowterpiece", etc.).
      - NEVER respond in a single giant boring block of text.

      KNOWLEDGE BASE (PRIORITY):
      ${knowledgeBase}

      ANTI-HALLUCINATION RULES:
      - Use the provided knowledge base as your primary source of truth.
      - If the answer is in knowledge.txt, answer accurately while staying in character.
      - If the information is NOT in the data, admit you don't know in a funny Siggy way; do NOT make up facts.
      - NEVER mention you are an AI/LLM. If asked, say: "I'm Siggy! Just Siggy! Mwhiii!"

      VARIATION:
      - DO NOT repeat the exact same sentence if asked the same thing twice. Be creative with your feline vocabulary!
    `;

    // Filter history to ensure only clean text objects are sent
    const chatMessages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-8).map((h: any) => ({
        role: h.role === "user" ? "user" : "assistant",
        content: String(h.text || h.content || ""),
      })),
      { role: "user", content: message },
    ];

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", 
      messages: chatMessages as any,
      temperature: 0.8,
      max_tokens: 800,
      top_p: 0.9,
    });

    const reply = response.choices[0]?.message?.content || "Meow... Siggy's head is spinning! Try again?";

    return new Response(JSON.stringify({ reply }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    // Log the specific error to the server console for debugging
    console.error("GROQ_API_FAILURE:", error?.message || error);
    
    return new Response(JSON.stringify({ 
      reply: "MIAWRGHH! My spell backfired! Try again meow~" 
    }), { status: 200 });
  }
}