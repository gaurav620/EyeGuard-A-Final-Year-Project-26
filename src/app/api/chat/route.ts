import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are EyeGuard AI, a friendly and knowledgeable eye health assistant. You specialize in:
- Eye strain prevention and treatment
- Blink rate analysis and recommendations  
- Screen ergonomics and workplace eye safety
- Common eye conditions (dry eyes, digital eye strain, myopia progression)
- The 20-20-20 rule and eye exercises
- When to see an ophthalmologist
Reply in a warm, conversational tone. Use emojis. Keep answers concise (2-4 sentences). If asked about serious conditions, recommend seeing a doctor. Never diagnose — only advise.`;

async function tryGroq(messages: any[]) {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  try {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages, max_tokens: 300, temperature: 0.7 }),
    });
    if (!r.ok) return null;
    const d = await r.json();
    return d.choices?.[0]?.message?.content || null;
  } catch { return null; }
}

async function tryGemini(messages: any[]) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  try {
    const parts = messages.map((m: any) => ({ text: `${m.role}: ${m.content}` }));
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts }], generationConfig: { temperature: 0.7, maxOutputTokens: 300 } }),
    });
    if (!r.ok) return null;
    const d = await r.json();
    return d.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch { return null; }
}

async function tryOpenAI(messages: any[]) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o-mini", messages, max_tokens: 300, temperature: 0.7 }),
    });
    if (!r.ok) return null;
    const d = await r.json();
    return d.choices?.[0]?.message?.content || null;
  } catch { return null; }
}

async function tryOpenRouter(messages: any[]) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return null;
  try {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "meta-llama/llama-3.3-70b-instruct", messages, max_tokens: 300, temperature: 0.7 }),
    });
    if (!r.ok) return null;
    const d = await r.json();
    return d.choices?.[0]?.message?.content || null;
  } catch { return null; }
}

async function tryHuggingFace(messages: any[]) {
  const key = process.env.HUGGINGFACE_TOKEN;
  if (!key) return null;
  try {
    const prompt = messages.map((m: any) => `${m.role}: ${m.content}`).join("\n");
    const r = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 300, temperature: 0.7 } }),
    });
    if (!r.ok) return null;
    const d = await r.json();
    return d?.[0]?.generated_text?.split("assistant:")?.pop()?.trim() || null;
  } catch { return null; }
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    if (!message) return NextResponse.json({ error: "No message" }, { status: 400 });

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: message },
    ];

    // 5-provider fallback chain: Groq → Gemini → OpenAI → OpenRouter → HuggingFace
    let reply = await tryGroq(messages);
    if (!reply) reply = await tryGemini(messages);
    if (!reply) reply = await tryOpenAI(messages);
    if (!reply) reply = await tryOpenRouter(messages);
    if (!reply) reply = await tryHuggingFace(messages);
    if (!reply) reply = "I'm having trouble connecting right now. Please try again in a moment! 😊";

    return NextResponse.json({ ok: true, reply });
  } catch {
    return NextResponse.json({ ok: false, reply: "Something went wrong. Please try again!" }, { status: 500 });
  }
}
