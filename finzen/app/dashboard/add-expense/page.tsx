"use client"

import type React from "react"

import { useState } from "react"
import { useUserData } from "@/contexts/user-data-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react"
import { predictExpenseType, predictExpenseCategory } from "@/lib/ml-models"

export default function AddExpensePage() {
  const { userData, addExpense, updateWeeklyWantsLimit } = useUserData()
  const { toast } = useToast()

  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [addToLimit, setAddToLimit] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pendingExpense, setPendingExpense] = useState<any>(null)

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!description || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid description and amount.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const expenseAmount = Number(amount)

      // Check if user has enough funds
      if ((userData?.available_funds || 0) < expenseAmount) {
        toast({
          title: "Insufficient funds",
          description: "You don't have enough funds for this expense.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Predict expense type and category
      const predictedType = predictExpenseType(description)
      const predictedCategory = predictExpenseCategory(description, predictedType)

      // Check if expense exceeds weekly wants limit
      if (predictedType === "Wants" && userData?.budget_limits?.Wants) {
        const startOfWeek = new Date()
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())

        const weeklyWantsTotal = userData.expenses
          .filter((e) => e.type === "Wants" && new Date(e.date) >= startOfWeek)
          .reduce((sum, e) => sum + e.total_amount, 0)

        if (weeklyWantsTotal + expenseAmount > userData.budget_limits.Wants) {
          toast({
            title: "Weekly limit exceeded",
            description: "This expense would exceed your weekly 'Wants' limit.",
            variant: "destructive",
          })
          setIsSubmitting(false)
          return
        }

        // Check for Zen Mode
        if (userData.zen_mode && weeklyWantsTotal + expenseAmount > 0.5 * userData.budget_limits.Wants) {
          setPendingExpense({
            description,
            total_amount: expenseAmount,
            category: predictedCategory,
            type: predictedType,
          })
          setIsSubmitting(false)
          return
        }
      }

      const success = await addExpense({
        description,
        total_amount: expenseAmount,
        category: predictedCategory,
        type: predictedType,
      })

      if (success) {
        toast({
          title: "Expense added",
          description: "Your expense has been recorded successfully.",
        })
        setDescription("")
        setAmount("")
      } else {
        toast({
          title: "Failed to add expense",
          description: "There was an error adding your expense. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding expense:", error)
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddToLimit = async () => {
    if (!addToLimit || isNaN(Number(addToLimit)) || Number(addToLimit) <= 0) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid amount to add to your limit.",
        variant: "destructive",
      })
      return
    }

    const newLimit = (userData?.budget_limits?.Wants || 0) + Number(addToLimit)
    const success = await updateWeeklyWantsLimit(newLimit)

    if (success) {
      toast({
        title: "Limit updated",
        description: `Weekly 'Wants' limit increased to ₹${newLimit}.`,
      })
      setAddToLimit("")
    }
  }

  const handleConfirmExpense = async () => {
    if (!pendingExpense) return

    setIsSubmitting(true)

    try {
      const success = await addExpense(pendingExpense)

      if (success) {
        toast({
          title: "Expense added",
          description: "Your expense has been recorded successfully.",
        })
        setDescription("")
        setAmount("")
        setPendingExpense(null)
      }
    } catch (error) {
      console.error("Error adding expense:", error)
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelExpense = () => {
    // In a real app, this would add to zen_savings
    toast({
      title: "Expense cancelled",
      description: `₹${pendingExpense?.total_amount} saved as XP!`,
    })
    setPendingExpense(null)
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Add Expense</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Status</CardTitle>
              <CardDescription>Your financial overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Available Funds</div>
                  <div className="font-medium">₹{userData?.available_funds || 0}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Weekly 'Wants' Limit</div>
                  <div className="font-medium">₹{weeklyWantsLimit}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Weekly 'Wants' Spent</div>
                  <div className="font-medium">₹{weeklyWantsTotal}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Remaining</div>
                  <div className="font-medium">₹{Math.max(0, weeklyWantsLimit - weeklyWantsTotal)}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div>Weekly 'Wants' Usage</div>
                  <div>{weeklyWantsPercentage.toFixed(0)}%</div>
                </div>
                <Progress value={weeklyWantsPercentage} className="h-2" />

                {weeklyWantsPercentage >= 100 && (
                  <div className="flex items-center gap-2 rounded-md bg-red-500/10 p-2 text-sm text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    <span>You've reached your weekly limit!</span>
                  </div>
                )}

                {weeklyWantsPercentage >= 75 && weeklyWantsPercentage < 100 && (
                  <div className="flex items-center gap-2 rounded-md bg-yellow-500/10 p-2 text-sm text-yellow-500">
                    <AlertTriangle className="h-4 w-4" />
                    <span>You're approaching your weekly limit.</span>
                  </div>
                )}

                {weeklyWantsPercentage < 75 && weeklyWantsPercentage > 0 && (
                  <div className="flex items-center gap-2 rounded-md bg-green-500/10 p-2 text-sm text-green-500">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>You're within your weekly budget.</span>
                  </div>
                )}
              </div>

              <div className="flex items-end gap-2">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="add-to-limit">Add to Weekly 'Wants' Limit</Label>
                  <Input
                    id="add-to-limit"
                    type="number"
                    placeholder="Amount"
                    value={addToLimit}
                    onChange={(e) => setAddToLimit(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddToLimit}>Add</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Zen Mode</CardTitle>
              <CardDescription>
                {userData?.zen_mode ? "Zen Mode is currently enabled" : "Zen Mode is currently disabled"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">
                {userData?.zen_mode
                  ? "With Zen Mode enabled, you'll be prompted to reconsider 'Wants' expenses when you've used more than 50% of your weekly limit."
                  : "Enable Zen Mode to help control impulse spending and save more."}
              </div>

              <div className="rounded-lg bg-primary/10 p-4 text-sm">
                <p>
                  💡 <strong>Zen Mode Benefits:</strong>
                </p>
                <ul className="list-disc pl-4 mt-2 space-y-1">
                  <li>Helps control impulse spending</li>
                  <li>Builds mindful spending habits</li>
                  <li>Increases your FinPet XP</li>
                  <li>Helps you reach your financial goals faster</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {pendingExpense ? (
            <Card className="border-yellow-500/50">
              <CardHeader className="bg-yellow-500/10">
                <CardTitle className="flex items-center gap-2 text-yellow-500">
                  <AlertTriangle className="h-5 w-5" />
                  Zen Mode: Spending Check
                </CardTitle>
                <CardDescription>You've used more than 50% of your 'Wants' limit this week.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="rounded-lg bg-card p-4">
                  <div className="text-sm font-medium">Expense Details</div>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">Description</div>
                      <div className="font-medium">{pendingExpense.description}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm">Amount</div>
                      <div className="font-medium">₹{pendingExpense.total_amount}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm">Category</div>
                      <div className="font-medium">{pendingExpense.category}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm">Type</div>
                      <div className="font-medium">{pendingExpense.type}</div>
                    </div>
                  </div>
                </div>

                <div className="text-center text-sm">
                  <p>Do you really need this? Save now, thrive later. 🌱</p>
                  <p className="mt-1 text-muted-foreground">
                    If you cancel, the amount will be added to your FinPet XP!
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleCancelExpense}>
                  Cancel & Save
                </Button>
                <Button onClick={handleConfirmExpense} disabled={isSubmitting}>
                  Confirm Expense
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>New Expense</CardTitle>
                <CardDescription>Record a new expense</CardDescription>
              </CardHeader>
              <form onSubmit={handleAddExpense}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="What did you spend on?"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="How much did you spend?"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>

                  <div className="rounded-lg bg-card p-4 text-sm">
                    <p>
                      ✨ <strong>Smart Categorization:</strong>
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      Your expense will be automatically categorized as "Wants" or "Needs" and assigned to the
                      appropriate category.
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Expense"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Spending Tips</CardTitle>
              <CardDescription>Smart recommendations for better financial health</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-card p-4">
                <div className="font-medium">50/30/20 Rule</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Allocate 50% of your income to needs, 30% to wants, and 20% to savings for a balanced budget.
                </div>
              </div>

              <div className="rounded-lg bg-card p-4">
                <div className="font-medium">24-Hour Rule</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  For non-essential purchases, wait 24 hours before buying to avoid impulse spending.
                </div>
              </div>

              <div className="rounded-lg bg-card p-4">
                <div className="font-medium">Cash Envelope System</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Use physical cash in envelopes for different spending categories to stay within budget.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

