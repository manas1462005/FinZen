import { MongoClient } from "mongodb"
import { sha256 } from "js-sha256"

// MongoDB connection
const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://soveetprusty:@Noobdamaster69@cluster0.bjzstq0.mongodb.net/?retryWrites=true&w=majority"
let client: MongoClient
let clientPromise: Promise<MongoClient>

if (!global._mongoClientPromise) {
  client = new MongoClient(uri)
  global._mongoClientPromise = client.connect()
}
clientPromise = global._mongoClientPromise

// Database and collections
export async function getDb() {
  const client = await clientPromise
  return client.db("agri_app")
}

// Helper functions
export function hashPassword(password: string): string {
  return sha256(password)
}

export async function authenticateUser(username: string, password: string): Promise<any> {
  const db = await getDb()
  const user = await db.collection("users").findOne({ username })
  return user && user.password === hashPassword(password) ? user : null
}

export async function registerUser(username: string, password: string): Promise<boolean> {
  const db = await getDb()
  const existingUser = await db.collection("users").findOne({ username })

  if (existingUser) {
    return false
  }

  await db.collection("users").insertOne({
    username,
    password: hashPassword(password),
  })

  await db.collection("user_data").insertOne({
    username,
    expenses: [],
    goals: [],
    available_funds: 0,
    budget_limits: { Wants: 0, Needs: 0 },
    pet_level: 1,
    rewards: [],
    zen_savings: 0,
    zen_mode: false,
    last_weekly_reset: new Date().toISOString(),
    tracking_enabled: true,
  })

  return true
}

export async function getUserData(username: string) {
  const db = await getDb()
  return db.collection("user_data").findOne({ username })
}

export async function updateUserData(username: string, update: any) {
  const db = await getDb()
  await db.collection("user_data").updateOne({ username }, { $set: update })
}

export async function addExpense(username: string, expense: any) {
  const db = await getDb()
  await db.collection("user_data").updateOne(
    { username },
    {
      $push: { expenses: expense },
      $set: { available_funds: expense.available_funds },
    },
  )
}

export async function addFunds(username: string, amount: number) {
  const db = await getDb()
  const userData = await getUserData(username)
  const newFunds = userData.available_funds + amount

  const expense = {
    description: "Added funds",
    total_amount: amount,
    category: "Miscellaneous",
    type: "Wants",
    date: new Date().toISOString(),
  }

  await db.collection("user_data").updateOne(
    { username },
    {
      $push: { expenses: expense },
      $set: { available_funds: newFunds },
    },
  )

  return newFunds
}

export async function addGoal(username: string, goal: any) {
  const db = await getDb()
  await db.collection("user_data").updateOne({ username }, { $push: { goals: goal } })
}

export async function toggleZenMode(username: string) {
  const db = await getDb()
  const userData = await getUserData(username)
  await db.collection("user_data").updateOne({ username }, { $set: { zen_mode: !userData.zen_mode } })
  return !userData.zen_mode
}

export async function updateWeeklyWantsLimit(username: string, newLimit: number) {
  const db = await getDb()
  const userData = await getUserData(username)
  const budgetLimits = userData.budget_limits || {}
  budgetLimits.Wants = newLimit

  await db.collection("user_data").updateOne({ username }, { $set: { budget_limits: budgetLimits } })
}

export async function checkWeeklyReset(username: string) {
  const db = await getDb()
  const userData = await getUserData(username)

  if (!userData) return

  const lastReset = new Date(userData.last_weekly_reset)
  const now = new Date()
  const oneWeek = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

  if (now.getTime() - lastReset.getTime() > oneWeek) {
    // Calculate weekly cashback
    const weeklyLimit = userData.budget_limits?.Wants || 0
    const startOfWeek = new Date(lastReset)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())

    const weeklySpent = userData.expenses
      .filter((e) => e.type === "Wants" && new Date(e.date) >= startOfWeek)
      .reduce((sum, e) => sum + e.total_amount, 0)

    const unusedWants = Math.max(0, weeklyLimit - weeklySpent)
    const newSavings = userData.zen_savings + unusedWants
    const rewards = userData.rewards || []

    if (unusedWants > 0) {
      const cashback = Math.round(unusedWants * 0.1 * 100) / 100
      rewards.push(`Weekly Cashback: ₹${cashback} awarded for unused 'Wants' budget!`)
    }

    await db.collection("user_data").updateOne(
      { username },
      {
        $set: {
          zen_savings: newSavings,
          last_weekly_reset: now.toISOString(),
          rewards: rewards,
        },
      },
    )

    return { newSavings, rewards }
  }

  return null
}

export async function checkPetLevelUp(username: string) {
  const db = await getDb()
  const userData = await getUserData(username)

  if (!userData) return null

  let zenSavings = userData.zen_savings || 0
  let currentLevel = userData.pet_level || 1
  const rewards = userData.rewards || []
  let updated = false

  // Calculate how many levels can be upgraded
  while (true) {
    const requiredXp = currentLevel * 500
    if (zenSavings >= requiredXp) {
      const levelsGained = Math.floor(zenSavings / requiredXp)
      if (levelsGained === 0) break

      const newLevel = currentLevel + levelsGained
      zenSavings = zenSavings % requiredXp // Remainder after leveling
      updated = true

      // Add rewards for each level gained
      for (let lvl = currentLevel + 1; lvl <= newLevel; lvl++) {
        const cashback = lvl * 50
        rewards.push(`Level ${lvl} Reward: ₹${cashback} cashback!`)
        if (lvl % 3 === 0) {
          rewards.push(`🎉 Bonus Reward at Level ${lvl}!`)
        }
      }

      currentLevel = newLevel
    } else {
      break
    }
  }

  if (updated) {
    await db.collection("user_data").updateOne(
      { username },
      {
        $set: {
          pet_level: currentLevel,
          rewards: rewards,
          zen_savings: zenSavings,
        },
      },
    )

    return { currentLevel, rewards, zenSavings }
  }

  return null
}

