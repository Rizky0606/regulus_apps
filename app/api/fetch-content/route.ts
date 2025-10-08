export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const { url } = await req.json()
    if (!url || typeof url !== "string") {
      return Response.json({ error: "URL tidak valid" }, { status: 400 })
    }
    const r = await fetch(url, { redirect: "follow" })
    const text = await r.text()
    // naive title extraction
    const titleMatch = text.match(/<title>([^<]+)<\/title>/i)
    const bodyText = stripHtml(text).slice(0, 200000) // cap
    return Response.json({ title: titleMatch?.[1], text: bodyText })
  } catch (e: any) {
    return Response.json({ error: e?.message || "Gagal mengambil konten" }, { status: 500 })
  }
}

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s{2,}/g, " ")
}
