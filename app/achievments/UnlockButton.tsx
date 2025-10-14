'use client'

import { Button } from "@/components/ui/button"

interface Props{
    enabled:boolean
}

const UnlockButton = ({enabled}:Props) => {
  return (
    <div>
         <Button
              className={`${enabled ? 'mt-4 bg-gradient-to-r from-red-500 to-red-700 text-white text-xs font-semibold tracking-wide px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out border border-red-400' : 'hidden'} `}
              size="sm"
            >
              🎯 Unlock Badge
            </Button>
    </div>
  )
}

export default UnlockButton