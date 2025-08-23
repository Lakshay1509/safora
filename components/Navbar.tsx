"use client"

import { Search, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import LoginButton from "./LoginLogoutButton"

export function Navbar() {
  

  return (
    <nav className="w-full border-b" style={{ backgroundColor: "#2C2C2C", borderColor: "#2A2A2A" }}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold" style={{ color: "#EAEAEA" }}>
              SafeSpot
            </h1>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                style={{ color: "#9CA3AF" }}
              />
              <Input
                type="text"
                placeholder="Search locations..."
                className="pl-10 w-full border-0 focus:ring-1 focus:ring-blue-500"
                style={{
                  backgroundColor: "#0D0D0D",
                  color: "#EAEAEA",
                  borderColor: "#2A2A2A",
                }}
              />
            </div>
          </div>

          {/* Profile and Logout */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-800" style={{ color: "#9CA3AF" }}>
              <User className="w-5 h-5" />
            </Button>
            <LoginButton/>
          </div>
        </div>
      </div>
    </nav>
  )
}
