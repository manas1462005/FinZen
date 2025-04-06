"use client"

import { useUserData } from "@/contexts/user-data-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { ArrowUpCircle, ArrowDownCircle, TrendingUp, TrendingDown, AlertCircle, Zap } from "lucide-react"

export default function DashboardPage() {
  const { userData, isLoading, refreshUserData, checkPetLevelUp } = useUserData()
  const [weeklyExpenses, setWeeklyExpenses] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [typeData, setTypeData] = useState<any[]>([])

  useEffect(() => {
    if (userData) {
      // Check for pet level up
      checkPetLevelUp()

      // Process expenses for charts
      processExpenses()
    }
  }, [userData])

  const processExpenses = () => {
    if (!userData?.expenses || userData.expenses.length === 0) {
      setWeeklyExpenses([])
      setCategoryData([])
      setTypeData([])
      return
    }

    // Get expenses from the last 7 days
    const now = new Date()
    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(now.getDate() - 7)

    const recentExpenses = userData.expenses.filter((expense) => {
      const expenseDate = new Date(expense.date)
      return expenseDate >= sevenDaysAgo
    })

    // Group by day for line chart
    const dailyExpenses: Record<string, number> = {}

    for (let i = 0; i < 7; i++) {
      const date = new Date(now)
      date.setDate(now.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]
      dailyExpenses[dateStr] = 0
    }

    recentExpenses.forEach((expense) => {
      const dateStr = new Date(expense.date).toISOString().split("T")[0]
      if (dailyExpenses[dateStr] !== undefined) {
        dailyExpenses[dateStr] += expense.total_amount
      }
    })

    const weeklyData = Object.entries(dailyExpenses)
      .map(([date, amount]) => ({
        date: date.split("-").slice(1).join("/"), // Format as MM/DD
        amount,
      }))
      .reverse()

    setWeeklyExpenses(weeklyData)

    // Group by category for pie chart
    const categories: Record<string, number> = {}

    recentExpenses.forEach((expense) => {
      const category = expense.category || "Other"
      if (!categories[category]) {
        categories[category] = 0
      }
      categories[category] += expense.total_amount
    })

    const categoryChartData = Object.entries(categories).map(([name, value]) => ({
      name,
      value,
    }))

    setCategoryData(categoryChartData)

    // Group by type (Wants vs Needs)
    const types: Record<string, number> = {
      Wants: 0,
      Needs: 0,
    }

    recentExpenses.forEach((expense) => {
      const type = expense.type || "Other"
      if (!types[type]) {
        types[type] = 0
      }
      types[type] += expense.total_amount
    })

    const typeChartData = Object.entries(types).map(([name, value]) => ({
      name,
      value,
    }))

    setTypeData(typeChartData)
  }

  const COLORS = ["#9333EA", "#EC4899", "#3B82F6", "#10B981", "#FBBF24", "#EF4444"]

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Available Funds</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{userData?.available_funds || 0}</div>
            <p className="text-xs text-muted-foreground">Your current balance</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Weekly Wants Limit</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{userData?.budget_limits?.Wants || 0}</div>
            <p className="text-xs text-muted-foreground">Your weekly spending limit</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Zen Savings</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{userData?.zen_savings || 0}</div>
            <p className="text-xs text-muted-foreground">XP for your FinPet</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">FinPet Level</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Level {userData?.pet_level || 1}</div>
            <p className="text-xs text-muted-foreground">Keep saving to level up!</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Weekly Spending</CardTitle>
                <CardDescription>Your spending over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={weeklyExpenses}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value}`, "Amount"]} />
                    <Bar dataKey="amount" fill="#9333EA" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
                <CardDescription>Distribution of your recent expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`₹${value}`, "Amount"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Wants vs Needs</CardTitle>
                <CardDescription>Balance between essential and discretionary spending</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell fill="#9333EA" />
                      <Cell fill="#3B82F6" />
                    </Pie>
                    <Tooltip formatter={(value) => [`₹${value}`, "Amount"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>FinPet Progress</CardTitle>
                <CardDescription>Level up your FinPet by saving more</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">
                      Level {userData?.pet_level || 1} → {(userData?.pet_level || 1) + 1}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {userData?.zen_savings || 0}/{(userData?.pet_level || 1) * 500} XP
                    </div>
                  </div>
                  <Progress
                    value={((userData?.zen_savings || 0) / ((userData?.pet_level || 1) * 500)) * 100}
                    className="h-2"
                  />
                </div>

                <div className="rounded-lg bg-primary/10 p-4">
                  <div className="font-medium">Zen Savings Tips</div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Use Zen Mode to help control impulse spending</li>
                      <li>Unused weekly wants budget converts to XP</li>
                      <li>Level up your FinPet to unlock rewards</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analytics</CardTitle>
              <CardDescription>In-depth analysis of your spending patterns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border bg-card p-4">
                  <div className="flex items-center gap-2">
                    <ArrowUpCircle className="h-4 w-4 text-green-500" />
                    <div className="text-sm font-medium">Top Income</div>
                  </div>
                  <div className="mt-2 text-2xl font-bold">
                    ₹
                    {userData?.expenses
                      .filter((e) => e.description === "Added funds")
                      .reduce((max, e) => Math.max(max, e.total_amount), 0) || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Largest single deposit</div>
                </div>

                <div className="rounded-lg border bg-card p-4">
                  <div className="flex items-center gap-2">
                    <ArrowDownCircle className="h-4 w-4 text-red-500" />
                    <div className="text-sm font-medium">Top Expense</div>
                  </div>
                  <div className="mt-2 text-2xl font-bold">
                    ₹
                    {userData?.expenses
                      .filter((e) => e.description !== "Added funds")
                      .reduce((max, e) => Math.max(max, e.total_amount), 0) || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Largest single expense</div>
                </div>

                <div className="rounded-lg border bg-card p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <div className="text-sm font-medium">Avg. Daily</div>
                  </div>
                  <div className="mt-2 text-2xl font-bold">
                    ₹
                    {weeklyExpenses.length > 0
                      ? Math.round(weeklyExpenses.reduce((sum, day) => sum + day.amount, 0) / weeklyExpenses.length)
                      : 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Average daily spending</div>
                </div>

                <div className="rounded-lg border bg-card p-4">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-yellow-500" />
                    <div className="text-sm font-medium">Savings Rate</div>
                  </div>
                  <div className="mt-2 text-2xl font-bold">
                    {userData?.zen_savings && userData.available_funds
                      ? Math.round((userData.zen_savings / (userData.zen_savings + userData.available_funds)) * 100)
                      : 0}
                    %
                  </div>
                  <div className="text-xs text-muted-foreground">Percentage of total saved</div>
                </div>
              </div>

              {/* More analytics content would go here */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Insights</CardTitle>
              <CardDescription>Smart recommendations based on your spending</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {userData?.budget_limits?.Wants === 0 && (
                <div className="rounded-lg border bg-yellow-500/10 p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    <div className="font-medium">Set a Weekly Wants Limit</div>
                  </div>
                  <div className="mt-2 text-sm">
                    Setting a weekly budget for discretionary spending helps control impulse purchases and builds saving
                    habits.
                  </div>
                </div>
              )}

              {typeData.length > 0 &&
                typeData[0].name === "Wants" &&
                typeData[0].value > (typeData[1]?.value || 0) * 1.5 && (
                  <div className="rounded-lg border bg-red-500/10 p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <div className="font-medium">High Wants Spending</div>
                    </div>
                    <div className="mt-2 text-sm">
                      Your discretionary spending is significantly higher than essential expenses. Consider balancing
                      your spending to improve financial health.
                    </div>
                  </div>
                )}

              {userData?.zen_mode === false && (
                <div className="rounded-lg border bg-primary/10 p-4">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <div className="font-medium">Enable Zen Mode</div>
                  </div>
                  <div className="mt-2 text-sm">
                    Zen Mode helps you make mindful spending decisions by adding a reflection step before completing
                    purchases.
                  </div>
                </div>
              )}

              {/* More insights would go here */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

