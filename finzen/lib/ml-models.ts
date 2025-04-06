// This is a simplified version of the ML models from the Python code
// In a real application, you would use a proper ML library or API

export function predictExpenseType(description: string): string {
  const desc = description.toLowerCase()

  // Simple keyword-based classification
  const needsKeywords = [
    "rent",
    "mortgage",
    "electricity",
    "water",
    "gas",
    "internet",
    "phone bill",
    "grocery",
    "groceries",
    "food",
    "medicine",
    "medical",
    "insurance",
    "transport",
    "transportation",
    "bus",
    "train",
    "subway",
    "education",
    "tuition",
    "textbook",
    "school",
  ]

  if (needsKeywords.some((keyword) => desc.includes(keyword))) {
    return "Needs"
  }

  return "Wants"
}

export function predictExpenseCategory(description: string, type: string): string {
  const desc = description.toLowerCase()

  // Food category
  const foodKeywords = [
    "dinner",
    "lunch",
    "breakfast",
    "meal",
    "snack",
    "pizza",
    "burger",
    "sushi",
    "coffee",
    "tea",
    "restaurant",
    "cafe",
    "food",
    "grocery",
    "groceries",
    "supermarket",
  ]
  if (foodKeywords.some((keyword) => desc.includes(keyword))) {
    return "Food"
  }

  // Utilities category
  const utilitiesKeywords = [
    "electricity",
    "water",
    "gas",
    "internet",
    "cable",
    "phone bill",
    "rent",
    "tax",
    "maintenance",
    "utility",
    "utilities",
  ]
  if (utilitiesKeywords.some((keyword) => desc.includes(keyword))) {
    return "Utilities"
  }

  // Transport category
  const transportKeywords = [
    "bus",
    "taxi",
    "uber",
    "subway",
    "train",
    "ferry",
    "ride",
    "car",
    "bike",
    "transport",
    "transportation",
    "fuel",
    "gas",
    "petrol",
  ]
  if (transportKeywords.some((keyword) => desc.includes(keyword))) {
    return "Transport"
  }

  // Shopping category
  const shoppingKeywords = [
    "shoes",
    "bag",
    "clothes",
    "jacket",
    "accessory",
    "electronics",
    "watch",
    "jeans",
    "decor",
    "shopping",
    "purchase",
    "buy",
    "bought",
  ]
  if (shoppingKeywords.some((keyword) => desc.includes(keyword))) {
    return "Shopping"
  }

  // Education category
  const educationKeywords = [
    "course",
    "textbook",
    "tuition",
    "language",
    "workshop",
    "software",
    "seminar",
    "study",
    "certification",
    "journal",
    "education",
    "school",
    "college",
    "university",
    "class",
    "lesson",
  ]
  if (educationKeywords.some((keyword) => desc.includes(keyword))) {
    return "Education"
  }

  // Entertainment category
  const entertainmentKeywords = [
    "movie",
    "concert",
    "comedy",
    "streaming",
    "theatre",
    "festival",
    "dance",
    "sports",
    "game",
    "amusement",
    "entertainment",
    "fun",
    "party",
    "event",
  ]
  if (entertainmentKeywords.some((keyword) => desc.includes(keyword))) {
    return "Entertainment"
  }

  // Health category
  const healthKeywords = [
    "doctor",
    "hospital",
    "medicine",
    "medical",
    "health",
    "healthcare",
    "clinic",
    "pharmacy",
    "prescription",
    "therapy",
    "treatment",
  ]
  if (healthKeywords.some((keyword) => desc.includes(keyword))) {
    return "Health"
  }

  // Default to Miscellaneous
  return "Miscellaneous"
}

