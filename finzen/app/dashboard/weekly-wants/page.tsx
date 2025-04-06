"use client"

import { useUserData } from "@/contexts/user-data-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"
import { AlertCircle, AlertTriangle, CheckCircle2, TrendingDown, TrendingUp } from "lucide-react"

export default function WeeklyWantsPage() {
  const { userData, updateWeeklyWantsLimit } = useUserData()
  const { toast } = useToast()

  const [newLimit, setNewLimit] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdateLimit = async () => {
    if (!newLimit || isNaN(Number(newLimit)) || Number(newLimit) < 0) {
      toast({
        title: "Invalid limit",
        description: "Please enter a valid amount for your weekly limit.",
        variant: "destructive",
      })
      return
    }

    setIsUpdating(true)

    try {
      const success = await updateWeeklyWantsLimit(Number(newLimit))

      if (success) {
        toast({
          title: "Limit updated",
          description: `Weekly 'Wants' limit set to ₹${newLimit}.`,
        })
        setNewLimit("")
      }
    } catch (error) {
      console.error("Error updating limit:", error)
      toast({
        title: "Error",
        description: "Failed to update limit. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Calculate weekly wants progress
  const startOfWeek = new Date()
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())

  const weeklyWantsTotal =
    userData?.expenses
      ?.filter((e) => e.type === "Wants" && new Date(e.date) >= startOfWeek)
      .reduce((sum, e) => sum + e.total_amount, 0) || 0

  const weeklyWantsLimit = userData?.budget_limits?.Wants || 0
  const weeklyWantsPercentage = weeklyWantsLimit > 0 ? Math.min(100, (weeklyWantsTotal / weeklyWantsLimit) * 100) : 0

  // Get daily spending for the week
  const dailySpending: Record<string, number> = {}

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    const dateStr = date.toISOString().split("T")[0]
    dailySpending[dateStr] = 0
  }

  if (userData?.expenses) {
    userData.expenses
      .filter((e) => e.type === "Wants" && new Date(e.date) >= startOfWeek)
      .forEach((expense) => {
        const dateStr = new Date(expense.date).toISOString().split("T")[0]
        if (dailySpending[dateStr] !== undefined) {
          dailySpending[dateStr] += expense.total_amount
        }
      })
  }

  const dailySpendingArray = Object.entries(dailySpending).map(([date, amount]) => ({
    date: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
    amount,
  }))

  // Find highest and lowest spending days
  const highestDay = [...dailySpendingArray].sort((a, b) => b.amount - a.amount)[0]
  const lowestDay = [...dailySpendingArray].filter((day) => day.amount > 0).sort((a, b) => a.amount - b.amount)[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Weekly Wants</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly 'Wants' Budget</CardTitle>
            <CardDescription>Track your discretionary spending</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Current Limit</div>
                <div className="font-medium">₹{weeklyWantsLimit}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Spent This Week</div>
                <div className="font-medium">₹{weeklyWantsTotal}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Remaining</div>
                <div className="font-medium">₹{Math.max(0, weeklyWantsLimit - weeklyWantsTotal)}</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div>Weekly Usage</div>
                <div>{weeklyWantsPercentage.toFixed(0)}%</div>
              </div>
              <Progress value={weeklyWantsPercentage} className="h-3" />

              {weeklyWantsPercentage >= 100 && (
                <div className="flex items-center gap-2 rounded-md bg-red-500/10 p-3 text-sm text-red-500">
                  <AlertCircle className="h-4 w-4" />
                  <span>You've reached your weekly limit!</span>
                </div>
              )}

              {weeklyWantsPercentage >= 75 && weeklyWantsPercentage < 100 && (
                <div className="flex items-center gap-2 rounded-md bg-yellow-500/10 p-3 text-sm text-yellow-500">
                  <AlertTriangle className="h-4 w-4" />
                  <span>You're approaching your weekly limit.</span>
                </div>
              )}

              {weeklyWantsPercentage < 75 && weeklyWantsPercentage > 0 && (
                <div className="flex items-center gap-2 rounded-md bg-green-500/10 p-3 text-sm text-green-500">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>You're within your weekly budget.</span>
                </div>
              )}

              {weeklyWantsLimit === 0 && (
                <div className="flex items-center gap-2 rounded-md bg-blue-500/10 p-3 text-sm text-blue-500">
                  <AlertCircle className="h-4 w-4" />
                  <span>You haven't set a weekly limit yet.</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-limit">Update Weekly Limit</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="new-limit"
                  type="number"
                  placeholder="Enter new limit"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                />
                <Button onClick={handleUpdateLimit} disabled={isUpdating}>
                  {isUpdating ? "Updating..." : "Update"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Breakdown</CardTitle>
            <CardDescription>Your 'Wants' spending by day this week</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-7 gap-2">
              {dailySpendingArray.map((day, index) => {
                const height =
                  weeklyWantsLimit > 0 ? Math.max(15, (day.amount / weeklyWantsLimit) * 100) : day.amount > 0 ? 15 : 5

                return (
                  <div key={index} className="flex flex-col items-center">
                    <div className="text-xs text-muted-foreground">{day.date}</div>
                    <div className="mt-1 flex h-[100px] items-end">
                      <div
                        className={`w-8 rounded-t-md ${day.amount > 0 ? "bg-primary/80" : "bg-muted"}`}
                        style={{ height: `${Math.min(100, height)}px` }}
                      />
                    </div>
                    <div className="mt-1 text-xs font-medium">₹{day.amount}</div>
                  </div>
                )
              })}
            </div>

            <div className="space-y-4">
              {highestDay && highestDay.amount > 0 && (
                <div className="flex items-start gap-3 rounded-lg border p-3">
                  <TrendingUp className="h-5 w-5 text-red-500" />
                  <div>
                    <div className="font-medium">Highest Spending Day</div>
                    <div className="text-sm text-muted-foreground">
                      {highestDay.date}: ₹{highestDay.amount}
                    </div>
                  </div>
                </div>
              )}

              {lowestDay && (
                <div className="flex items-start gap-3 rounded-lg border p-3">
                  <TrendingDown className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="font-medium">Lowest Spending Day</div>
                    <div className="text-sm text-muted-foreground">
                      {lowestDay.date}: ₹{lowestDay.amount}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col text-sm text-muted-foreground">
            <p>
              💡 <strong>Weekly Rewards:</strong> Any unused 'Wants' budget at the end of the week will earn you 10%
              cashback as FinPet XP!
            </p>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly 'Wants' Expenses</CardTitle>
          <CardDescription>Your discretionary spending this week</CardDescription>
        </CardHeader>
        <CardContent>
          {userData?.expenses &&
          userData.expenses.filter((e) => e.type === "Wants" && new Date(e.date) >= startOfWeek).length > 0 ? (
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-2 text-left font-medium">Date</th>
                    <th className="px-4 py-2 text-left font-medium">Description</th>
                    <th className="px-4 py-2 text-left font-medium">Category</th>
                    <th className="px-4 py-2 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {userData.expenses
                    .filter((e) => e.type === "Wants" && new Date(e.date) >= startOfWeek)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((expense, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-4 py-2">{new Date(expense.date).toLocaleDateString()}</td>
                        <td className="px-4 py-2">{expense.description}</td>
                        <td className="px-4 py-2">{expense.category}</td>
                        <td className="px-4 py-2 text-right">₹{expense.total_amount}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <h3 className="text-lg font-medium">No 'Wants' expenses this week</h3>
              <p className="mt-1 text-sm text-muted-foreground">Any discretionary spending will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

