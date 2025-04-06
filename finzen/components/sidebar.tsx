"use client"

import { usePathname, useRouter } from "next/navigation"
import { useUserData } from "@/contexts/user-data-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Home, PlusCircle, History, Target, Calendar, MessageSquare, Zap } from "lucide-react"
import { useEffect, useState } from "react"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { userData } = useUserData()
  const [petImage, setPetImage] = useState<string | null>(null)
  const [petName, setPetName] = useState<string>("FinPet")

  useEffect(() => {
    if (userData) {
      const level = userData.pet_level || 1

      if (level < 5) {
        setPetImage(null)
        setPetName("🥚 Egg")
      } else if (level < 15) {
        setPetImage("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gif1-9dqeN5pzi8PjhQXKJ4oVxHZTAeggbR.gif")
        setPetName("Ghastly")
      } else if (level < 25) {
        setPetImage("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gif2-fIYwfNcxPSos6IHi0Ql5Aneokrxhvs.gif")
        setPetName("Haunter")
      } else {
        setPetImage("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gif3-qZ3uj4AC1NA0ZTyIzC5ZpLwpd8b8ie.gif")
        setPetName("Gengar")
      }
    }
  }, [userData])

  const navItems = [
    {
      name: "Home",
      href: "/dashboard",
      icon: Home,
    },
    {
      name: "Add Expense",
      href: "/dashboard/add-expense",
      icon: PlusCircle,
    },
    {
      name: "Expense History",
      href: "/dashboard/expense-history",
      icon: History,
    },
    {
      name: "Funds & Goals",
      href: "/dashboard/funds-goals",
      icon: Target,
    },
    {
      name: "Weekly Wants",
      href: "/dashboard/weekly-wants",
      icon: Calendar,
    },
    {
      name: "Chatbot",
      href: "/dashboard/chatbot",
      icon: MessageSquare,
    },
    {
      name: "Zen Mode",
      href: "/dashboard/zen",
      icon: Zap,
    },
    {
      name: "FinPet",
      href: "/dashboard/finpet",
      icon: () => <div className="h-4 w-4 flex items-center justify-center">🐾</div>,
    },
  ]

  return (
    <div className="hidden border-r bg-card/50 md:block md:w-64">
      <div className="flex h-full flex-col gap-2 p-4">
        <div className="flex flex-col items-center py-4">
          {petImage ? (
            <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-primary">
              <img src={petImage || "/placeholder.svg"} alt={petName} className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-4xl">
              🥚
            </div>
          )}
          <div className="mt-2 text-center">
            <div className="font-medium">{petName}</div>
            <div className="text-sm text-muted-foreground">Level {userData?.pet_level || 1}</div>
          </div>
        </div>

        <div className="space-y-1 py-2">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant={pathname === item.href ? "secondary" : "ghost"}
              className={cn("w-full justify-start", pathname === item.href && "bg-primary/10 text-primary")}
              onClick={() => router.push(item.href)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.name}
            </Button>
          ))}
        </div>

        <div className="mt-auto">
          <div className="rounded-lg bg-card p-4">
            <div className="text-sm font-medium">Zen Savings</div>
            <div className="mt-1 text-2xl font-bold">₹{userData?.zen_savings || 0}</div>
            <div className="mt-1 text-xs text-muted-foreground">Save more to level up your FinPet!</div>
          </div>
        </div>
      </div>
    </div>
  )
}

