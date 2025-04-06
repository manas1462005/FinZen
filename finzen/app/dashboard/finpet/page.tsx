"use client"

import { useEffect, useState } from "react"
import { useUserData } from "@/contexts/user-data-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUp, Gift, Star, Trophy } from "lucide-react"

export default function FinPetPage() {
  const { userData, checkPetLevelUp } = useUserData()
  const [petImage, setPetImage] = useState<string | null>(null)
  const [petName, setPetName] = useState<string>("FinPet")
  const [petStatus, setPetStatus] = useState<string>("Egg")

  useEffect(() => {
    // Check for level up when the page loads
    checkPetLevelUp()

    if (userData) {
      const level = userData.pet_level || 1

      if (level < 5) {
        setPetImage(null)
        setPetName("Egg")
        setPetStatus("Hatch at Level 5")
      } else if (level < 15) {
        setPetImage("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gif1-9dqeN5pzi8PjhQXKJ4oVxHZTAeggbR.gif")
        setPetName("Ghastly")
        setPetStatus("Level 5-14")
      } else if (level < 25) {
        setPetImage("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gif2-fIYwfNcxPSos6IHi0Ql5Aneokrxhvs.gif")
        setPetName("Haunter")
        setPetStatus("Level 15-24")
      } else {
        setPetImage("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gif3-qZ3uj4AC1NA0ZTyIzC5ZpLwpd8b8ie.gif")
        setPetName("Gengar")
        setPetStatus("Level 25+")
      }
    }
  }, [userData, checkPetLevelUp])

  if (!userData) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  const level = userData.pet_level || 1
  const zenSavings = userData.zen_savings || 0
  const requiredXp = level * 500
  const progress = Math.min(100, (zenSavings / requiredXp) * 100)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Your FinPet</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>FinPet Status</CardTitle>
            <CardDescription>Level up your FinPet by saving more</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              {petImage ? (
                <div className="h-48 w-48 overflow-hidden rounded-full border-4 border-primary bg-primary/10">
                  <img src={petImage || "/placeholder.svg"} alt={petName} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="flex h-48 w-48 items-center justify-center rounded-full border-4 border-primary bg-primary/10 text-8xl">
                  🥚
                </div>
              )}
              <Badge className="absolute bottom-2 right-2 bg-primary px-3 py-1 text-lg">Lv.{level}</Badge>
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold">{petName}</h2>
              <p className="text-muted-foreground">{petStatus}</p>
            </div>

            <div className="w-full max-w-md space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div>Progress to Level {level + 1}</div>
                <div>
                  {zenSavings}/{requiredXp} XP
                </div>
              </div>
              <Progress value={progress} className="h-3" />
              <p className="text-center text-sm text-muted-foreground">
                {requiredXp - zenSavings} XP needed for next level
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evolution Path</CardTitle>
            <CardDescription>Your FinPet's growth journey</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div
                className={`flex items-center gap-4 rounded-lg border p-3 ${level >= 5 ? "border-green-500/50 bg-green-500/10" : ""}`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-2xl">🥚</div>
                <div className="flex-1">
                  <div className="font-medium">Egg</div>
                  <div className="text-sm text-muted-foreground">Level 1-4</div>
                </div>
                {level >= 5 ? (
                  <Badge variant="outline" className="border-green-500 text-green-500">
                    Unlocked
                  </Badge>
                ) : (
                  <Badge variant="outline">{level}/5</Badge>
                )}
              </div>

              <div
                className={`flex items-center gap-4 rounded-lg border p-3 ${level >= 5 ? "border-green-500/50 bg-green-500/10" : ""}`}
              >
                <div className="h-12 w-12 overflow-hidden rounded-full bg-primary/20">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gif1-9dqeN5pzi8PjhQXKJ4oVxHZTAeggbR.gif"
                    alt="Ghastly"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Ghastly</div>
                  <div className="text-sm text-muted-foreground">Level 5-14</div>
                </div>
                {level >= 5 ? (
                  <Badge variant="outline" className="border-green-500 text-green-500">
                    Unlocked
                  </Badge>
                ) : (
                  <Badge variant="outline">{level}/5</Badge>
                )}
              </div>

              <div
                className={`flex items-center gap-4 rounded-lg border p-3 ${level >= 15 ? "border-green-500/50 bg-green-500/10" : ""}`}
              >
                <div className="h-12 w-12 overflow-hidden rounded-full bg-primary/20">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gif2-fIYwfNcxPSos6IHi0Ql5Aneokrxhvs.gif"
                    alt="Haunter"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Haunter</div>
                  <div className="text-sm text-muted-foreground">Level 15-24</div>
                </div>
                {level >= 15 ? (
                  <Badge variant="outline" className="border-green-500 text-green-500">
                    Unlocked
                  </Badge>
                ) : (
                  <Badge variant="outline">{level}/15</Badge>
                )}
              </div>

              <div
                className={`flex items-center gap-4 rounded-lg border p-3 ${level >= 25 ? "border-green-500/50 bg-green-500/10" : ""}`}
              >
                <div className="h-12 w-12 overflow-hidden rounded-full bg-primary/20">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gif3-qZ3uj4AC1NA0ZTyIzC5ZpLwpd8b8ie.gif"
                    alt="Gengar"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Gengar</div>
                  <div className="text-sm text-muted-foreground">Level 25+</div>
                </div>
                {level >= 25 ? (
                  <Badge variant="outline" className="border-green-500 text-green-500">
                    Unlocked
                  </Badge>
                ) : (
                  <Badge variant="outline">{level}/25</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rewards & Achievements</CardTitle>
            <CardDescription>Benefits from leveling up your FinPet</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="rewards">
              <TabsList className="w-full">
                <TabsTrigger value="rewards" className="flex-1">
                  Rewards
                </TabsTrigger>
                <TabsTrigger value="achievements" className="flex-1">
                  Achievements
                </TabsTrigger>
              </TabsList>

              <TabsContent value="rewards" className="mt-4 space-y-4">
                {userData.rewards && userData.rewards.length > 0 ? (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {userData.rewards
                      .slice()
                      .reverse()
                      .map((reward, index) => (
                        <div key={index} className="flex items-start gap-3 rounded-lg border p-3">
                          <Gift className="h-5 w-5 text-primary" />
                          <div>
                            <div className="font-medium">{reward}</div>
                            <div className="text-xs text-muted-foreground">Keep saving to earn more rewards!</div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-6 text-center">
                    <Gift className="mx-auto h-8 w-8 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-medium">No rewards yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Level up your FinPet to earn rewards.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="achievements" className="mt-4 space-y-4">
                <div className="space-y-3">
                  <div
                    className={`flex items-start gap-3 rounded-lg border p-3 ${level >= 5 ? "border-green-500/50 bg-green-500/10" : ""}`}
                  >
                    <Trophy className={`h-5 w-5 ${level >= 5 ? "text-green-500" : "text-muted-foreground"}`} />
                    <div>
                      <div className="font-medium">First Evolution</div>
                      <div className="text-xs text-muted-foreground">
                        Reach Level 5 to evolve your FinPet from an egg
                      </div>
                    </div>
                    {level >= 5 && (
                      <Badge variant="outline" className="ml-auto border-green-500 text-green-500">
                        Completed
                      </Badge>
                    )}
                  </div>

                  <div
                    className={`flex items-start gap-3 rounded-lg border p-3 ${level >= 15 ? "border-green-500/50 bg-green-500/10" : ""}`}
                  >
                    <Trophy className={`h-5 w-5 ${level >= 15 ? "text-green-500" : "text-muted-foreground"}`} />
                    <div>
                      <div className="font-medium">Second Evolution</div>
                      <div className="text-xs text-muted-foreground">Reach Level 15 to evolve your FinPet again</div>
                    </div>
                    {level >= 15 && (
                      <Badge variant="outline" className="ml-auto border-green-500 text-green-500">
                        Completed
                      </Badge>
                    )}
                  </div>

                  <div
                    className={`flex items-start gap-3 rounded-lg border p-3 ${level >= 25 ? "border-green-500/50 bg-green-500/10" : ""}`}
                  >
                    <Trophy className={`h-5 w-5 ${level >= 25 ? "text-green-500" : "text-muted-foreground"}`} />
                    <div>
                      <div className="font-medium">Final Evolution</div>
                      <div className="text-xs text-muted-foreground">Reach Level 25 to achieve the final evolution</div>
                    </div>
                    {level >= 25 && (
                      <Badge variant="outline" className="ml-auto border-green-500 text-green-500">
                        Completed
                      </Badge>
                    )}
                  </div>

                  <div
                    className={`flex items-start gap-3 rounded-lg border p-3 ${zenSavings >= 5000 ? "border-green-500/50 bg-green-500/10" : ""}`}
                  >
                    <Star className={`h-5 w-5 ${zenSavings >= 5000 ? "text-green-500" : "text-muted-foreground"}`} />
                    <div>
                      <div className="font-medium">Savings Master</div>
                      <div className="text-xs text-muted-foreground">Accumulate ₹5,000 in Zen Savings</div>
                    </div>
                    {zenSavings >= 5000 && (
                      <Badge variant="outline" className="ml-auto border-green-500 text-green-500">
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => checkPetLevelUp()}>
              <ArrowUp className="mr-2 h-4 w-4" />
              Check for Level Up
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

