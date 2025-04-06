"use client"

import { useUserData } from "@/contexts/user-data-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Zap, ZapOff, Lightbulb, TrendingUp, Sparkles } from "lucide-react"

export default function ZenPage() {
  const { userData, toggleZenMode } = useUserData()
  const { toast } = useToast()

  const handleToggleZenMode = async () => {
    try {
      const success = await toggleZenMode()

      if (success) {
        toast({
          title: userData?.zen_mode ? "Zen Mode disabled" : "Zen Mode enabled",
          description: userData?.zen_mode
            ? "You've turned off Zen Mode."
            : "You've turned on Zen Mode. Mindful spending activated!",
        })
      }
    } catch (error) {
      console.error("Error toggling Zen mode:", error)
      toast({
        title: "Error",
        description: "Failed to toggle Zen Mode. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Zen Mode</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Zen Mode Settings</CardTitle>
          <CardDescription>Control your impulse spending and save more</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="zen-mode">Zen Mode</Label>
              <p className="text-sm text-muted-foreground">
                {userData?.zen_mode ? "Zen Mode is currently enabled" : "Zen Mode is currently disabled"}
              </p>
            </div>
            <Switch id="zen-mode" checked={userData?.zen_mode || false} onCheckedChange={handleToggleZenMode} />
          </div>

          <div className="rounded-lg bg-primary/10 p-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <div className="font-medium">How Zen Mode Works</div>
            </div>
            <div className="mt-2 text-sm">
              <p>
                When Zen Mode is enabled, you'll be prompted to reconsider 'Wants' expenses when you've used more than
                50% of your weekly limit.
              </p>
              <p className="mt-2">
                If you choose to skip the expense, the amount will be added to your FinPet XP, helping you level up
                faster!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Zen Savings</CardTitle>
            <CardDescription>Your progress through mindful spending</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Total Saved</div>
                <div className="text-2xl font-bold">₹{userData?.zen_savings || 0}</div>
              </div>
            </div>

            <div className="rounded-lg bg-card p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div className="font-medium">Savings Impact</div>
              </div>
              <div className="mt-2 text-sm">
                <p>Your Zen savings have helped you reach level {userData?.pet_level || 1} with your FinPet.</p>
                <p className="mt-1">Keep saving to unlock more rewards and achievements!</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Zen Benefits</CardTitle>
            <CardDescription>Why mindful spending matters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border p-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">Level Up Faster</div>
                <div className="text-sm text-muted-foreground">Skipped expenses convert directly to FinPet XP</div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border p-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">Reach Goals Sooner</div>
                <div className="text-sm text-muted-foreground">
                  Every saved rupee brings you closer to your financial goals
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border p-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">Build Better Habits</div>
                <div className="text-sm text-muted-foreground">
                  Develop mindful spending patterns that last a lifetime
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border p-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">Reduce Impulse Purchases</div>
                <div className="text-sm text-muted-foreground">
                  The reflection period helps avoid regrettable spending
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Zen Mode Tips</CardTitle>
          <CardDescription>Maximize your savings with these strategies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <div className="font-medium">24-Hour Rule</div>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                For non-essential purchases, wait 24 hours before buying to avoid impulse spending.
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <div className="font-medium">Needs vs. Wants</div>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Before each purchase, ask yourself: "Is this a need or a want?" Be honest with yourself.
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <div className="font-medium">Weekly Review</div>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Set aside time each week to review your expenses and celebrate your savings.
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <div className="font-medium">Visualization</div>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Visualize your financial goals to stay motivated when tempted to spend.
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={handleToggleZenMode}>
            {userData?.zen_mode ? (
              <>
                <ZapOff className="mr-2 h-4 w-4" />
                Disable Zen Mode
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Enable Zen Mode
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

