"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useUserData } from "@/contexts/user-data-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { Send } from "lucide-react"

type Message = {
  sender: "user" | "bot"
  text: string
  timestamp: Date
}

export default function ChatbotPage() {
  const { userData } = useUserData()
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Hello! I'm your FinZen assistant. How can I help you with your finances today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      sender: "user",
      text: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Generate bot response
    setTimeout(() => {
      const botResponse = generateResponse(input, userData)

      const botMessage: Message = {
        sender: "bot",
        text: botResponse,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
      setIsTyping(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">AI Chatbot</h1>
      </div>

      <Card className="h-[calc(100vh-12rem)]">
        <CardHeader>
          <CardTitle>FinZen Assistant</CardTitle>
          <CardDescription>Ask me anything about your finances, FinPet, or get financial advice</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col h-[calc(100%-8rem)] overflow-hidden">
          <div className="flex-1 overflow-y-auto pr-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="flex items-start gap-2 max-w-[80%]">
                    {message.sender === "bot" && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback className="bg-primary text-primary-foreground">F</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`rounded-lg p-3 ${
                        message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    {message.sender === "user" && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback>{user?.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2 max-w-[80%]">
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-primary text-primary-foreground">F</AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg p-3 bg-muted">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"></div>
                        <div
                          className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <form onSubmit={handleSendMessage} className="flex w-full gap-2">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
            />
            <Button type="submit" size="icon" disabled={isTyping}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}

function generateResponse(message: string, userData: any): string {
  const msg = message.toLowerCase()

  // Greetings
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    return "Hello! How can I help you with your finances today?"
  }

  if (msg.includes("how are you")) {
    return "I'm just a chatbot, but I'm here to help you manage your money and FinPet!"
  }

  // FinPet level
  if (msg.includes("finpet") || msg.includes("pet level") || msg.includes("what level")) {
    if (userData) {
      const level = userData.pet_level || 1
      return `Your FinPet is currently at level ${level}.`
    } else {
      return "I couldn't fetch your FinPet info. Please try again."
    }
  }

  // Expense history
  if (msg.includes("expense history") || msg.includes("my expenses") || msg.includes("what did i spend")) {
    if (userData && userData.expenses && userData.expenses.length > 0) {
      const totalSpent = userData.expenses
        .filter((e: any) => e.description !== "Added funds")
        .reduce((sum: number, e: any) => sum + e.total_amount, 0)

      return `You've recorded ${userData.expenses.length} expenses totaling ₹${totalSpent}. You can view your complete expense history in the Expense History tab.`
    } else {
      return "You haven't recorded any expenses yet."
    }
  }

  // Last expense
  if (msg.includes("last expense") || msg.includes("recent expense")) {
    if (userData && userData.expenses && userData.expenses.length > 0) {
      const lastExpense = userData.expenses[userData.expenses.length - 1]
      return `Your last expense was '${lastExpense.description}' costing ₹${lastExpense.total_amount}.`
    } else {
      return "You haven't recorded any expenses yet."
    }
  }

  // Weekly wants
  if (msg.includes("weekly wants") || msg.includes("weekly spending") || msg.includes("wants this week")) {
    if (userData) {
      const weeklyLimit = userData.budget_limits?.Wants || 0

      const startOfWeek = new Date()
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())

      const weeklyWantsTotal =
        userData.expenses
          ?.filter((e: any) => e.type === "Wants" && new Date(e.date) >= startOfWeek)
          .reduce((sum: number, e: any) => sum + e.total_amount, 0) || 0

      return `You have spent ₹${weeklyWantsTotal} on 'Wants' this week out of a limit of ₹${weeklyLimit}.`
    } else {
      return "I couldn't fetch your weekly wants info. Please try again."
    }
  }

  // Funds / Balance
  if (msg.includes("my funds") || msg.includes("available funds") || msg.includes("balance")) {
    if (userData) {
      return `Your available funds are ₹${userData.available_funds || 0}.`
    } else {
      return "I couldn't fetch your funds info. Please try again."
    }
  }

  // Goals
  if (msg.includes("goal") || msg.includes("goals")) {
    if (userData && userData.goals && userData.goals.length > 0) {
      const goalsList = userData.goals.map((g: any) => `${g.name}: ₹${g.amount}`).join(", ")

      return `Your financial goals are: ${goalsList}. You can track your progress in the Funds & Goals tab.`
    } else {
      return "You haven't set any financial goals yet."
    }
  }

  // Zen mode
  if (msg.includes("zen mode") || msg.includes("zen")) {
    if (userData) {
      const zenMode = userData.zen_mode
      return `Zen Mode is currently ${zenMode ? "enabled" : "disabled"}. ${
        zenMode ? "This helps you make mindful spending decisions." : "Enable it to help control impulse spending."
      }`
    } else {
      return "I couldn't fetch your Zen Mode status. Please try again."
    }
  }

  // Financial advice
  if (msg.includes("advice") || msg.includes("tip") || msg.includes("help")) {
    const tips = [
      "Try the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings.",
      "For non-essential purchases, wait 24 hours before buying to avoid impulse spending.",
      "Track all your expenses, even small ones. They add up quickly!",
      "Set specific, measurable financial goals to stay motivated.",
      "Build an emergency fund that covers 3-6 months of expenses.",
      "Pay off high-interest debt first, like credit cards.",
      "Enable Zen Mode to help control impulse spending.",
      "Level up your FinPet by saving more and staying under your weekly 'Wants' limit.",
    ]

    return `Here's a financial tip: ${tips[Math.floor(Math.random() * tips.length)]}`
  }

  // Thank you
  if (msg.includes("thank")) {
    return "You're welcome! I'm here to help."
  }

  // Fallback
  return "I'm sorry, I didn't quite understand that. You can ask me about your expenses, funds, goals, FinPet, or for financial advice."
}

