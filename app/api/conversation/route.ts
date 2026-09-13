import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import db from "@/lib/db";

function getSessionId(req: NextRequest): { id: string; isNew: boolean } {
  const existing = req.cookies.get("session_id")?.value;
  if (existing) return { id: existing, isNew: false };
  return { id: randomUUID(), isNew: true };
}

export async function GET(req: NextRequest) {
  const { id, isNew } = getSessionId(req);
  const room = req.nextUrl.searchParams.get("room");

  if (!room) {
    return NextResponse.json({ error: "Missing room" }, { status: 400 });
  }

  if (isNew) {
    const res = NextResponse.json({ active: null, messages: [] });
    res.cookies.set("session_id", id, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 365 });
    return res;
  }

  const convo = db
    .prepare("SELECT active_character FROM conversations WHERE session_id = ? AND room = ?")
    .get(id, room) as { active_character: string } | undefined;

  const messages = db
    .prepare("SELECT speaker, text FROM messages WHERE session_id = ? AND room = ? ORDER BY id ASC")
    .all(id, room) as { speaker: string; text: string }[];

  return NextResponse.json({ active: convo?.active_character ?? null, messages });
}

export async function POST(req: NextRequest) {
  const { id, isNew } = getSessionId(req);
  const { room, active, messages } = await req.json();

  if (!room) {
    return NextResponse.json({ error: "Missing room" }, { status: 400 });
  }

  const now = Date.now();

  db.prepare(
    `INSERT INTO conversations (session_id, room, active_character, updated_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(session_id, room) DO UPDATE SET active_character = excluded.active_character, updated_at = excluded.updated_at`
  ).run(id, room, active, now);

  db.prepare("DELETE FROM messages WHERE session_id = ? AND room = ?").run(id, room);
  const insert = db.prepare(
    "INSERT INTO messages (session_id, room, speaker, text, created_at) VALUES (?, ?, ?, ?, ?)"
  );
  for (const m of messages as { speaker: string; text: string }[]) {
    insert.run(id, room, m.speaker, m.text, now);
  }

  const res = NextResponse.json({ ok: true });
  if (isNew) {
    res.cookies.set("session_id", id, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 365 });
  }
  return res;
}

export async function DELETE(req: NextRequest) {
  const { id } = getSessionId(req);
  const room = req.nextUrl.searchParams.get("room");

  if (!room) {
    return NextResponse.json({ error: "Missing room" }, { status: 400 });
  }

  db.prepare("DELETE FROM messages WHERE session_id = ? AND room = ?").run(id, room);
  db.prepare("DELETE FROM conversations WHERE session_id = ? AND room = ?").run(id, room);
  return NextResponse.json({ ok: true });
}
