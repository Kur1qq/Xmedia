import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
        return NextResponse.json({ error: "YouTube ID required" }, { status: 400 });
    }

    try {
        const res = await fetch(`https://www.youtube.com/watch?v=${id}`, {
            headers: {
                "Accept-Language": "en-US,en;q=0.9",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
        });
        
        if (!res.ok) {
            throw new Error(`Failed to fetch: ${res.statusText}`);
        }
        
        const html = await res.text();
        
        const viewCountMatch = html.match(/"viewCount":"(\d+)"/);
        const viewCount = viewCountMatch ? parseInt(viewCountMatch[1], 10) : 0;
        
        const dateMatch = html.match(/<meta\s+itemprop="datePublished"\s+content="([^"]+)"/);
        const date = dateMatch ? dateMatch[1] : null;

        return NextResponse.json({ viewCount, date });
    } catch (error) {
        console.error("YouTube parse error:", error);
        return NextResponse.json({ error: "Failed to fetch YouTube details" }, { status: 500 });
    }
}
