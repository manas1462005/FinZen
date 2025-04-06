import { type NextRequest, NextResponse } from "next/server"
import { checkPetLevelUp } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    const result = await checkPetLevelUp(username)

    if (!result) {
      return NextResponse.json({ leveledUp: false })
    }

    return NextResponse.json({
      leveledUp: true,
      newLevel: result.currentLevel,
      rewards: result.rewards,
      zenSavings: result.zenSavings,
    })
  } catch (error) {
    console.error("Check pet level up error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

