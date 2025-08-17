"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function MapCard() {
  return (
    <Card
      className="w-full text-white bg-white/5 backdrop-blur-md border border-white/10 h-80 lg:h-96 transition-colors duration-200 hover:shadow-lg"
      
      
    >
      <CardHeader>
        <CardTitle className="text-lg font-bold" style={{ color: "#EAEAEA" }}>
          Preacuations and Safety Concerns
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p style={{ color: "#9CA3AF" }}>Raat me mat jana 
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
