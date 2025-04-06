import { type NextRequest, NextResponse } from "next/server"
import { getUserData, checkWeeklyReset } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    // Check for weekly reset
    await checkWeeklyReset(username)

    const userData = await getUserData(username)

    if (!userData) {
      return NextResponse.json({ error: "User data not found" }, { status: 404 })
    }

    return NextResponse.json(userData)
  } catch (error) {
    console.error("Get user data error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

