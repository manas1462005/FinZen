import { type NextRequest, NextResponse } from "next/server"
import { addGoal } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { username, goal } = await request.json()

    if (!username || !goal || !goal.name || !goal.amount) {
      return NextResponse.json({ error: "Username, goal name, and amount are required" }, { status: 400 })
    }

    if (goal.amount <= 0) {
      return NextResponse.json({ error: "Goal amount must be greater than 0" }, { status: 400 })
    }

    await addGoal(username, goal)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Add goal error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

