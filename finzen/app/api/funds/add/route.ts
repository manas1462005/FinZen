import { type NextRequest, NextResponse } from "next/server"
import { addFunds } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { username, amount } = await request.json()

    if (!username || !amount) {
      return NextResponse.json({ error: "Username and amount are required" }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 })
    }

    const newFunds = await addFunds(username, amount)

    return NextResponse.json({ success: true, newFunds })
  } catch (error) {
    console.error("Add funds error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

