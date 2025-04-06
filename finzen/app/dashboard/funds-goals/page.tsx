"use client"

import type React from "react"

import { useState } from "react"
import { useUserData } from "@/contexts/user-data-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { PlusCircle, Target, Trophy, TrendingUp } from "lucide-react"

export default function FundsGoalsPage() {
  const { userData, addFunds, addGoal } = useUserData()
  const { toast } = useToast()

  const [fundAmount, setFundAmount] = useState("")
  const [goalName, setGoalName] = useState("")
  const [goalAmount, setGoalAmount] = useState("")
  const [isAddingFunds, setIsAddingFunds] = useState(false)
  const [isAddingGoal, setIsAddingGoal] = useState(false)

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fundAmount || isNaN(Number(fundAmount)) || Number(fundAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to add.",
        variant: "destructive",
      })
      return
    }

    setIsAddingFunds(true)

    try {
      const success = await addFunds(Number(fundAmount))

      if (success) {
        toast({
          title: "Funds added",
          description: `₹${fundAmount} has been added to your account.`,
        })
        setFundAmount("")
      }
    } catch (error) {
      console.error("Error adding funds:", error)
      toast({
        title: "Error",
        description: "Failed to add funds. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAddingFunds(false)
    }
  }

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!goalName) {
      toast({
        title: "Missing goal name",
        description: "Please enter a name for your goal.",
        variant: "destructive",
      })
      return
    }

    if (!goalAmount || isNaN(Number(goalAmount)) || Number(goalAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount for your goal.",
        variant: "destructive",
      })
      return
    }

    setIsAddingGoal(true)

    try {
      const success = await addGoal({
        name: goalName,
        amount: Number(goalAmount),
      })

      if (success) {
        toast({
          title: "Goal added",
          description: `Your goal "${goalName}" has been added.`,
        })
        setGoalName("")
        setGoalAmount("")
      }
    } catch (error) {
      console.error("Error adding goal:", error)
      toast({
        title: "Error",
        description: "Failed to add goal. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAddingGoal(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Funds & Goals</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage Funds</CardTitle>
              <CardDescription>Add money to your available funds</CardDescription>
            </CardHeader>
            <form onSubmit={handleAddFunds}>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-card p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Current Balance</div>
                    <div className="text-2xl font-bold">₹{userData?.available_funds || 0}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fund-amount">Amount to Add</Label>
                  <Input
                    id="fund-amount"
                    type="number"
                    placeholder="Enter amount"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isAddingFunds}>
                  {isAddingFunds ? "Adding..." : "Add Funds"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Zen Savings</CardTitle>
              <CardDescription>Your progress towards financial goals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-primary/10 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Total Saved</div>
                  <div className="text-2xl font-bold">₹{userData?.zen_savings || 0}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div>FinPet Level Progress</div>
                  <div>
                    {userData?.zen_savings || 0}/{(userData?.pet_level || 1) * 500} XP
                  </div>
                </div>
                <Progress
                  value={((userData?.zen_savings || 0) / ((userData?.pet_level || 1) * 500)) * 100}
                  className="h-2"
                />
              </div>

              <div className="rounded-lg bg-card p-4 text-sm">
                <p>
                  💡 <strong>How to Increase Zen Savings:</strong>
                </p>
                <ul className="list-disc pl-4 mt-2 space-y-1">
                  <li>Enable Zen Mode and skip unnecessary expenses</li>
                  <li>Stay under your weekly 'Wants' limit</li>
                  <li>Complete weekly challenges</li>
                  <li>Level up your FinPet for bonus rewards</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Set Financial Goal</CardTitle>
              <CardDescription>Create a new savings goal</CardDescription>
            </CardHeader>
            <form onSubmit={handleAddGoal}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="goal-name">Goal Name</Label>
                  <Input
                    id="goal-name"
                    placeholder="e.g., New Phone, Vacation"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal-amount">Target Amount (₹)</Label>
                  <Input
                    id="goal-amount"
                    type="number"
                    placeholder="Enter amount"
                    value={goalAmount}
                    onChange={(e) => setGoalAmount(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isAddingGoal}>
                  {isAddingGoal ? "Adding..." : "Add Goal"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Goals</CardTitle>
              <CardDescription>Track progress towards your financial goals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!userData?.goals || userData.goals.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center">
                  <Target className="mx-auto h-8 w-8 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-medium">No goals yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Set your first financial goal to start tracking progress.
                  </p>
                </div>
              ) : (
                userData.goals.map((goal, index) => {
                  const progress = Math.min(100, ((userData.zen_savings || 0) / goal.amount) * 100)
                  const isAchieved = progress >= 100

                  return (
                    <div
                      key={index}
                      className={`rounded-lg border p-4 ${isAchieved ? "border-green-500/50 bg-green-500/10" : ""}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            {isAchieved ? (
                              <Trophy className="h-4 w-4 text-green-500" />
                            ) : (
                              <Target className="h-4 w-4 text-primary" />
                            )}
                            <div className="font-medium">{goal.name}</div>
                          </div>
                          <div className="mt-1 text-sm text-muted-foreground">Target: ₹{goal.amount}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {isAchieved ? "Achieved!" : `${Math.round(progress)}%`}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            ₹{Math.min(userData.zen_savings || 0, goal.amount)}/₹{goal.amount}
                          </div>
                        </div>
                      </div>

                      <div className="mt-2">
                        <Progress value={progress} className={`h-2 ${isAchieved ? "bg-green-500/30" : ""}`} />
                      </div>

                      {isAchieved && (
                        <div className="mt-2 text-center text-sm text-green-500">
                          Congratulations! You've reached your goal! 🎉
                        </div>
                      )}
                    </div>
                  )
                })
              )}

              {userData?.goals && userData.goals.length > 0 && (
                <div className="rounded-lg bg-card p-4 text-sm">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <div className="font-medium">Goal Progress</div>
                  </div>
                  <div className="mt-2 text-muted-foreground">
                    Your Zen Savings (₹{userData.zen_savings || 0}) can be used to achieve any of your goals.
                  </div>
                </div>
              )}
            </CardContent>
            {userData?.goals && userData.goals.length > 0 && (
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    document.getElementById("goal-name")?.focus()
                  }}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Another Goal
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

