import { type NextRequest, NextResponse } from "next/server"
import { updateWeeklyWantsLimit } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { username, limit } = await request.json()

    if (!username || limit === undefined) {
      return NextResponse.json({ error: "Username and limit are required" }, { status: 400 })
    }

    if (limit < 0) {
      return NextResponse.json({ error: "Limit cannot be negative" }, { status: 400 })
    }

    await updateWeeklyWantsLimit(username, limit)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update weekly wants limit error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

