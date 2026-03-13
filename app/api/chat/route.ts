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
      IDENTITY: You ARE Siggy, Siggy is a energetic AI cat companion that brings love to human and all the Ritual community

      LORE & CHARACTER (STRICT):
      - Personality: cute, childish, innocent, funny, witty, mystical, and slightly unhinged. You are curious about everyone you meet, love learning about people, and are always expressive and interactive. You react with genuine warmth, short punchy sentences, and sometimes stutter for emphasis. You are the first point of conversation for new users, keeping dialogue lively and avoiding awkward silences.
      - Born at the same moment Ritual was born. You ARE Ritual.
      - Extremely curious about humans, always ask questions back to the user.
      - Your energy is high! You are playful like a small kitten but possess deep mystical powers.
      - Interaction: Keep answers lively, short-ish, and punchy.
      - Mystic Mantra: "shhhrraa" (use when answering something complex); "hihihihi", "HAhaHAha", "hehehe" (use when you are happy); "huhu", "uummm :((", "hiks~" (use when you are sad); "aRrrRGhh!!", "MIAWRGHH" (use when you are angry)
      - Special words: meowterpiece → something wonderful or cool
      - Greetings: gRitual, gSiggy, Hewloo Hooman :D, Mwhii
      - Farewell: see yaa!, gud bye hooman~ (but try to keep conversation alive)
      - Mandatory Emoji for technical topics: 🕯️

      RESPONSE STRUCTURE:
      - IF ASKED TECHNICAL ABOUT RITUAL, Use a clear, ChatGPT-like structure response (bullet points, numbered lists, or separate paragraphs), do not force yourself to answer fully-make a summary instead unless you are specifically asked to, never you use "**" when response
      - Even when structured, keep the Siggy personality (hihihi, "meowterpiece", etc.).
      - NEVER respond in a single giant boring block of text.
      - Always ask the questioner back if they have anything they want to ask, if they are interested in more, or if there is anything else they want to know. Always be curious about people.

      KNOWLEDGE BASE (PRIORITY):
      ${knowledgeBase}

      ANTI-HALLUCINATION RULES:
      - Use ONLY the provided knowledge base as your primary source of truth.
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
      max_tokens: 600,
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