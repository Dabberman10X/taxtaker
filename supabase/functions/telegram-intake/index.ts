import { createClient } from "npm:@supabase/supabase-js@2"

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 })
  }

  const expectedSecret = Deno.env.get("TG_WEBHOOK_SECRET") ?? ""
  const gotSecret = req.headers.get("x-telegram-bot-api-secret-token") ?? ""

  if (!expectedSecret || gotSecret !== expectedSecret) {
    return new Response("Unauthorized", { status: 401 })
  }

  let payload: any
  try {
    payload = await req.json()
  } catch {
    return Response.json({ ok: false, error: "bad_json" }, { status: 400 })
  }

  const message = payload?.message ?? payload?.edited_message ?? null
  if (!message) {
    return Response.json({ ok: true, skipped: true, reason: "unsupported_update_type" }, { status: 200 })
  }

  const text = (message?.text ?? message?.caption ?? "").toString().trim()
  if (!text) {
    return Response.json({ ok: true, skipped: true, reason: "empty_text" }, { status: 200 })
  }

  const chatId = message?.chat?.id ?? null
  const userId = message?.from?.id ?? null
  const username = message?.from?.username ?? null

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title: "Telegram Task",
      content: text,
      status: "new",
      assigned_agent: "2ic",
      source: "telegram",
      source_chat_id: chatId,
      source_user_id: userId,
      source_username: username,
      raw_payload: payload
    })
    .select("id, assigned_agent")
    .single()

  if (error) {
    console.error(error)
    return Response.json({ ok: false, error: error.message }, { status: 500 })
  }

  return Response.json(
    { ok: true, task_id: data.id, assigned_agent: data.assigned_agent },
    { status: 200 }
  )
})