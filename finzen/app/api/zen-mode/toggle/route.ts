import { type NextRequest, NextResponse } from "next/server"
import { toggleZenMode } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    const newZenMode = await toggleZenMode(username)

    return NextResponse.json({ success: true, zenMode: newZenMode })
  } catch (error) {
    console.error("Toggle Zen mode error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

