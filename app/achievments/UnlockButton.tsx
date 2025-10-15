'use client'

import { Button } from "@/components/ui/button"
import { addBadge } from "@/features/achievment/use-post-badge"

interface Props{
    enabled:boolean,
    id: number,
    streak: number,
    uniqueLocationReviews: number,
    postCount: number,
    articlesCount: number,
    upvotesData: number,
}



const UnlockButton = ({enabled,id,streak,uniqueLocationReviews,postCount,articlesCount,upvotesData}:Props) => {
  const mutation = addBadge();

  const handleClick =()=>{
    mutation.mutate({
      id,
      streak,
      uniqueLocationReviews,
      postCount,
      articlesCount,
      upvotesData
    })

  }
  return (
    <div>
         <Button
              className={`${enabled ? ' bg-gradient-to-r from-red-500 to-red-700 text-white text-xs font-semibold tracking-wide px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out border border-red-400' : 'hidden'} `}
              size="sm"
              onClick={handleClick}
              disabled={mutation.isPending}
            >
              Apply theme
            </Button>
    </div>
  )
}

export default UnlockButton