import fs from 'fs';
import path from 'path';

let cachedKnowledge: string | null = null;

export function loadKnowledge(): string {
  if (cachedKnowledge) return cachedKnowledge;
  try {
    const knowledgePath = path.join(process.cwd(), 'knowledge.txt');
    if (fs.existsSync(knowledgePath)) {
      cachedKnowledge = fs.readFileSync(knowledgePath, 'utf8');
      return cachedKnowledge;
    }
  } catch (e) {
    console.error("Failed to load knowledge base:", e);
  }
  return "";
}

export function getRelevantContext(query: string): string {
  const fullKnowledge = loadKnowledge();
  if (!fullKnowledge) return "";

  if (fullKnowledge.length > 6000) {
    const lines = fullKnowledge.split('\n');
    const queryTerms = query.toLowerCase().split(' ');
    
    const relevantLines = lines.filter(line => 
      queryTerms.some(term => term.length > 3 && line.toLowerCase().includes(term))
    );

    return relevantLines.length > 0 
      ? relevantLines.slice(0, 50).join('\n') 
      : lines.slice(0, 100).join('\n');
  }

  return fullKnowledge;
}

export function buildEnhancedSystemPrompt(basePrompt: string, userMessage: string): string {
  const context = getRelevantContext(userMessage);
  
  return `
${basePrompt}

=== RITUAL TECHNICAL DATA (ONLY USE IF RELEVANT) ===
${context}

STRICT INSTRUCTION:
1. If the information is NOT in the data above, say "Siggy doesn't know that yet, mwhii!" and point to docs.ritual.net.
2. DO NOT make up stories about Ritual technology.
3. Keep your Siggy personality (witty, cute) even when explaining technical things.
4. If the user asks something unrelated to Ritual or Siggy, answer as a playful cat but don't use the technical data.
5. Never use any language other than English to respond, always ask to use English!
`;
}