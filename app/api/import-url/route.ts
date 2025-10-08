import type { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ error: "URL tidak valid" }), { status: 400 })
    }
    const res = await fetch(url)
    const contentType = res.headers.get("content-type") || ""
    let text = ""
    if (contentType.includes("application/json")) {
      text = JSON.stringify(await res.json(), null, 2)
    } else {
      text = await res.text()
      // Ambil isi utama bila HTML sederhana
      if (contentType.includes("text/html")) {
        const stripped = text.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "")
        text = stripped
          .replace(/<[^>]+>/g, " ")
          .replace(/\s{2,}/g, " ")
          .trim()
      }
    }
    return Response.json({ text })
  } catch (e) {
    return new Response(JSON.stringify({ error: "Gagal mengambil konten" }), { status: 500 })
  }
}
