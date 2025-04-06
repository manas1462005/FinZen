"use client"

import { useState, useMemo, useEffect } from "react"
import { useUserData } from "@/contexts/user-data-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"

// Mock data for Paytm transactions
const mockPaytmTransactions = [
  {
    id: 1,
    date: "2023-10-15",
    description: "Mobile Recharge",
    amount: 499,
    category: "Utilities",
    type: "Needs",
    source: "Paytm",
    status: "Success",
  },
  {
    id: 2,
    date: "2023-10-14",
    description: "Electricity Bill",
    amount: 1250,
    category: "Utilities",
    type: "Needs",
    source: "Paytm",
    status: "Success",
  },
  {
    id: 3,
    date: "2023-10-12",
    description: "Groceries Payment",
    amount: 850,
    category: "Food",
    type: "Needs",
    source: "Paytm",
    status: "Success",
  },
  {
    id: 4,
    date: "2023-10-10",
    description: "Movie Tickets",
    amount: 600,
    category: "Entertainment",
    type: "Wants",
    source: "Paytm",
    status: "Success",
  },
  {
    id: 5,
    date: "2023-10-08",
    description: "Flight Booking",
    amount: 4500,
    category: "Transport",
    type: "Wants",
    source: "Paytm",
    status: "Success",
  },
  {
    id: 6,
    date: "2023-10-05",
    description: "Restaurant Payment",
    amount: 1200,
    category: "Food",
    type: "Wants",
    source: "Paytm",
    status: "Success",
  },
]

export default function ExpenseHistoryPage() {
  const { userData } = useUserData()
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [sourceFilter, setSourceFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date-desc")
  const [minAmount, setMinAmount] = useState("")
  const [maxAmount, setMaxAmount] = useState("")
  const [allTransactions, setAllTransactions] = useState<any[]>([])

  // Combine FinZen expenses and Paytm transactions
  useEffect(() => {
    if (!userData?.expenses) return

    // Format FinZen expenses to match the combined format
    const formattedExpenses = userData.expenses.map((expense, index) => ({
      id: `finzen-${index}`,
      date: expense.date,
      description: expense.description,
      amount: expense.total_amount,
      category: expense.category,
      type: expense.type,
      source: "FinZen",
      status: "Success",
    }))

    // Combine with Paytm transactions
    setAllTransactions([...formattedExpenses, ...mockPaytmTransactions])
  }, [userData?.expenses])

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    if (!allTransactions.length) return []

    return allTransactions
      .filter((transaction) => {
        // Apply search filter
        if (searchTerm && !transaction.description.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false
        }

        // Apply category filter
        if (categoryFilter !== "all" && transaction.category !== categoryFilter) {
          return false
        }

        // Apply type filter
        if (typeFilter !== "all" && transaction.type !== typeFilter) {
          return false
        }

        // Apply source filter
        if (sourceFilter !== "all" && transaction.source !== sourceFilter) {
          return false
        }

        // Apply status filter
        if (statusFilter !== "all" && transaction.status !== statusFilter) {
          return false
        }

        // Apply amount filters
        if (minAmount && transaction.amount < Number(minAmount)) {
          return false
        }

        if (maxAmount && transaction.amount > Number(maxAmount)) {
          return false
        }

        return true
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "date-asc":
            return new Date(a.date).getTime() - new Date(b.date).getTime()
          case "date-desc":
            return new Date(b.date).getTime() - new Date(a.date).getTime()
          case "amount-asc":
            return a.amount - b.amount
          case "amount-desc":
            return b.amount - a.amount
          default:
            return new Date(b.date).getTime() - new Date(a.date).getTime()
        }
      })
  }, [
    allTransactions,
    searchTerm,
    categoryFilter,
    typeFilter,
    sourceFilter,
    statusFilter,
    minAmount,
    maxAmount,
    sortBy,
  ])

  // Extract unique categories for filter dropdown
  const categories = useMemo(() => {
    if (!allTransactions.length) return []

    const uniqueCategories = new Set<string>()
    allTransactions.forEach((transaction) => {
      if (transaction.category) {
        uniqueCategories.add(transaction.category)
      }
    })

    return Array.from(uniqueCategories).sort()
  }, [allTransactions])

  // Calculate summary statistics
  const summary = useMemo(() => {
    if (!filteredTransactions.length) return { total: 0, wants: 0, needs: 0, finzen: 0, paytm: 0 }

    const total = filteredTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)
    const wants = filteredTransactions
      .filter((transaction) => transaction.type === "Wants")
      .reduce((sum, transaction) => sum + transaction.amount, 0)
    const needs = filteredTransactions
      .filter((transaction) => transaction.type === "Needs")
      .reduce((sum, transaction) => sum + transaction.amount, 0)
    const finzen = filteredTransactions
      .filter((transaction) => transaction.source === "FinZen")
      .reduce((sum, transaction) => sum + transaction.amount, 0)
    const paytm = filteredTransactions
      .filter((transaction) => transaction.source === "Paytm")
      .reduce((sum, transaction) => sum + transaction.amount, 0)

    return { total, wants, needs, finzen, paytm }
  }, [filteredTransactions])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Expense History</h1>
      </div>

      <Tabs defaultValue="summary">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="transactions">All Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{summary.total.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{filteredTransactions.length} transactions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Wants vs Needs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Wants</div>
                    <div className="text-lg font-medium">₹{summary.wants.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round((summary.wants / summary.total) * 100) || 0}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Needs</div>
                    <div className="text-lg font-medium">₹{summary.needs.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round((summary.needs / summary.total) * 100) || 0}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">By Source</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">FinZen</div>
                    <div className="text-lg font-medium">₹{summary.finzen.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round((summary.finzen / summary.total) * 100) || 0}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Paytm</div>
                    <div className="text-lg font-medium">₹{summary.paytm.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round((summary.paytm / summary.total) * 100) || 0}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>Your spending by category</CardDescription>
            </CardHeader>
            <CardContent>
              {categories.length > 0 ? (
                <div className="space-y-4">
                  {categories.map((category) => {
                    const categoryTotal = filteredTransactions
                      .filter((t) => t.category === category)
                      .reduce((sum, t) => sum + t.amount, 0)

                    const percentage = Math.round((categoryTotal / summary.total) * 100) || 0

                    return (
                      <div key={category} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Badge variant="outline" className="mr-2">
                              {category}
                            </Badge>
                            <span>₹{categoryTotal.toLocaleString()}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{percentage}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-secondary">
                          <div className="h-2 rounded-full bg-primary" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">No data available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>View and filter your expense history from all sources</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Wants">Wants</SelectItem>
                      <SelectItem value="Needs">Needs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source">Source</Label>
                  <Select value={sourceFilter} onValueChange={setSourceFilter}>
                    <SelectTrigger id="source">
                      <SelectValue placeholder="All Sources" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      <SelectItem value="FinZen">FinZen</SelectItem>
                      <SelectItem value="Paytm">Paytm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="sort">Sort By</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger id="sort">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date-desc">Date (Newest First)</SelectItem>
                      <SelectItem value="date-asc">Date (Oldest First)</SelectItem>
                      <SelectItem value="amount-desc">Amount (Highest First)</SelectItem>
                      <SelectItem value="amount-asc">Amount (Lowest First)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min-amount">Min Amount</Label>
                  <Input
                    id="min-amount"
                    type="number"
                    placeholder="Min amount"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-amount">Max Amount</Label>
                  <Input
                    id="max-amount"
                    type="number"
                    placeholder="Max amount"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">
                            {format(new Date(transaction.date), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{transaction.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={transaction.type === "Wants" ? "default" : "secondary"}
                              className={
                                transaction.type === "Wants"
                                  ? "bg-primary/20 text-primary hover:bg-primary/30"
                                  : "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30"
                              }
                            >
                              {transaction.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                transaction.source === "FinZen"
                                  ? "border-primary/50 text-primary"
                                  : "border-blue-500/50 text-blue-500"
                              }
                            >
                              {transaction.source}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={transaction.description === "Added funds" ? "text-green-500" : "text-red-500"}
                            >
                              {transaction.description === "Added funds" ? "+" : "-"}₹{transaction.amount}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

