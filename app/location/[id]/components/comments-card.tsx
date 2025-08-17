"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function CommentsCard() {
  return (
    <Card
      className="w-full text-white bg-white/5 backdrop-blur-md border border-white/10 min-h-64 transition-colors duration-200 hover:shadow-lg"
     
     
    >
      <CardHeader>
        <CardTitle className="text-lg font-bold" style={{ color: "#EAEAEA" }}>
          Comments
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p style={{ color: "#9CA3AF" }}>Comments content will be displayed here</p>
        </div>
      </CardContent>
    </Card>
  )
}
