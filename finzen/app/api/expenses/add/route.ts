import { type NextRequest, NextResponse } from "next/server"
import { getUserData, updateUserData } from "@/lib/db"
import { predictExpenseType, predictExpenseCategory } from "@/lib/ml-models"

export async function POST(request: NextRequest) {
  try {
    const { username, expense } = await request.json()

    if (!username || !expense) {
      return NextResponse.json({ error: "Username and expense data are required" }, { status: 400 })
    }

    const userData = await getUserData(username)

    if (!userData) {
      return NextResponse.json({ error: "User data not found" }, { status: 404 })
    }

    // Check if tracking is enabled
    if (!userData.tracking_enabled) {
      return NextResponse.json({ error: "Expense tracking is disabled" }, { status: 400 })
    }

    // Check if user has enough funds
    if (userData.available_funds < expense.total_amount) {
      return NextResponse.json({ error: "Insufficient funds" }, { status: 400 })
    }

    // If expense type is not provided, predict it
    if (!expense.type) {
      expense.type = predictExpenseType(expense.description)
    }

    // If expense category is not provided, predict it
    if (!expense.category) {
      expense.category = predictExpenseCategory(expense.description, expense.type)
    }

    // Check if expense exceeds weekly wants limit
    if (expense.type === "Wants") {
      const weeklyLimit = userData.budget_limits?.Wants || 0

      if (weeklyLimit > 0) {
        const startOfWeek = new Date()
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())

        const weeklyWantsTotal = userData.expenses
          .filter((e) => e.type === "Wants" && new Date(e.date) >= startOfWeek)
          .reduce((sum, e) => sum + e.total_amount, 0)

        if (weeklyWantsTotal + expense.total_amount > weeklyLimit) {
          return NextResponse.json({ error: "This expense exceeds your weekly wants limit" }, { status: 400 })
        }

        // Check for Zen Mode
        if (userData.zen_mode && weeklyWantsTotal + expense.total_amount > 0.5 * weeklyLimit) {
          return NextResponse.json(
            {
              warning: "Zen Mode: You've used more than 50% of your wants limit",
              pendingExpense: expense,
            },
            { status: 200 },
          )
        }
      }
    }

    // Add expense to user data
    const updatedExpenses = [...userData.expenses, expense]
    const updatedFunds = userData.available_funds - expense.total_amount

    await updateUserData(username, {
      expenses: updatedExpenses,
      available_funds: updatedFunds,
    })

    return NextResponse.json({
      success: true,
      newBalance: updatedFunds,
    })
  } catch (error) {
    console.error("Add expense error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

