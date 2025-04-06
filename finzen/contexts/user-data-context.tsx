"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "./auth-context"
import { useToast } from "@/components/ui/use-toast"

type Expense = {
  description: string
  total_amount: number
  category: string
  type: string
  date: string
}

type Goal = {
  name: string
  amount: number
}

type UserData = {
  username: string
  expenses: Expense[]
  goals: Goal[]
  available_funds: number
  budget_limits: {
    Wants: number
    Needs: number
  }
  pet_level: number
  rewards: string[]
  zen_savings: number
  zen_mode: boolean
  last_weekly_reset: string
  tracking_enabled: boolean
}

type UserDataContextType = {
  userData: UserData | null
  isLoading: boolean
  refreshUserData: () => Promise<void>
  addExpense: (expense: Omit<Expense, "date">) => Promise<boolean>
  addFunds: (amount: number) => Promise<boolean>
  addGoal: (goal: Goal) => Promise<boolean>
  toggleZenMode: () => Promise<boolean>
  updateWeeklyWantsLimit: (limit: number) => Promise<boolean>
  checkPetLevelUp: () => Promise<void>
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined)

export function UserDataProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  const fetchUserData = async () => {
    if (!user) {
      setUserData(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/user-data?username=${user.username}`)

      if (!response.ok) {
        throw new Error("Failed to fetch user data")
      }

      const data = await response.json()
      setUserData(data)
    } catch (error) {
      console.error("Error fetching user data:", error)
      toast({
        title: "Error",
        description: "Failed to load your data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [user])

  const refreshUserData = async () => {
    await fetchUserData()
  }

  const addExpense = async (expense: Omit<Expense, "date">) => {
    if (!user) return false

    try {
      const response = await fetch("/api/expenses/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          expense: {
            ...expense,
            date: new Date().toISOString(),
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add expense")
      }

      await refreshUserData()
      return true
    } catch (error) {
      console.error("Error adding expense:", error)
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  const addFunds = async (amount: number) => {
    if (!user) return false

    try {
      const response = await fetch("/api/funds/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          amount,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add funds")
      }

      await refreshUserData()
      return true
    } catch (error) {
      console.error("Error adding funds:", error)
      toast({
        title: "Error",
        description: "Failed to add funds. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  const addGoal = async (goal: Goal) => {
    if (!user) return false

    try {
      const response = await fetch("/api/goals/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          goal,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add goal")
      }

      await refreshUserData()
      return true
    } catch (error) {
      console.error("Error adding goal:", error)
      toast({
        title: "Error",
        description: "Failed to add goal. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  const toggleZenMode = async () => {
    if (!user) return false

    try {
      const response = await fetch("/api/zen-mode/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to toggle Zen mode")
      }

      await refreshUserData()
      return true
    } catch (error) {
      console.error("Error toggling Zen mode:", error)
      toast({
        title: "Error",
        description: "Failed to toggle Zen mode. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  const updateWeeklyWantsLimit = async (limit: number) => {
    if (!user) return false

    try {
      const response = await fetch("/api/wants-limit/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          limit,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update weekly wants limit")
      }

      await refreshUserData()
      return true
    } catch (error) {
      console.error("Error updating weekly wants limit:", error)
      toast({
        title: "Error",
        description: "Failed to update weekly wants limit. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  const checkPetLevelUp = async () => {
    if (!user) return

    try {
      const response = await fetch("/api/pet/level-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to check pet level up")
      }

      const result = await response.json()

      if (result.leveledUp) {
        toast({
          title: "Level Up!",
          description: `Your FinPet is now level ${result.newLevel}!`,
          variant: "default",
        })
        await refreshUserData()
      }
    } catch (error) {
      console.error("Error checking pet level up:", error)
    }
  }

  return (
    <UserDataContext.Provider
      value={{
        userData,
        isLoading,
        refreshUserData,
        addExpense,
        addFunds,
        addGoal,
        toggleZenMode,
        updateWeeklyWantsLimit,
        checkPetLevelUp,
      }}
    >
      {children}
    </UserDataContext.Provider>
  )
}

export function useUserData() {
  const context = useContext(UserDataContext)
  if (context === undefined) {
    throw new Error("useUserData must be used within a UserDataProvider")
  }
  return context
}

