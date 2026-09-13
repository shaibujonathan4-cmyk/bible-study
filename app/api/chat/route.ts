import { NextRequest, NextResponse } from "next/server";
import { buildSystemPrompt } from "@/lib/characters/personas";

type HistoryItem = { speaker: string; text: string };

export async function POST(req: NextRequest) {
  try {
    const { character, history } = await req.json();

    if (!character || !Array.isArray(history)) {
      return NextResponse.json({ error: "Missing character or history" }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "GROQ_API_KEY environment variable is not set." }, { status: 500 });
    }

    const speakers: string[] = Array.from(
      new Set(history.map((m: HistoryItem) => m.speaker).filter((s: string) => s !== "You"))
    );

    const systemPrompt = buildSystemPrompt(character, speakers);

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map((m: HistoryItem) => ({
        role: m.speaker === "You" ? "user" : "assistant",
        content: m.speaker === "You" ? m.text : `[As ${m.speaker}]: ${m.text}`,
      })),
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages,
        max_tokens: 400,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq API HTTP Error:", errText);
      return NextResponse.json({ error: errText }, { status: response.status });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? "...";
    return NextResponse.json({ text });
  } catch (err: any) {
    console.error("Internal Route Error:", err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
