import { useGetCode } from "@/features/referral/use-get-code"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useState } from "react"

interface GetCodePopoverProps {
  children: React.ReactNode
  onOpenChange?: (open: boolean) => void
}

const GetCodePopover = ({ children, onOpenChange }: GetCodePopoverProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  
  // Only fetch when popover is open
  const { data, isLoading } = useGetCode(isOpen)

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    onOpenChange?.(open)
  }

  const handleCopy = async () => {
    if (data?.data.code) {
      await navigator.clipboard.writeText(data?.data.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div>
            
            <p className="text-sm text-gray-500">Share this code with friends</p>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="flex-1 p-3 bg-gray-100 rounded-md font-mono text-sm">
                {data?.data.code || "No code available"}
              </div>
              <Button
                size="icon"
                variant="outline"
                onClick={handleCopy}
                disabled={!data?.data.code}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default GetCodePopover