'use client'

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

export interface StreakData {
  id: string
  count: number
  created_at?: string
  updated_at?: string
}

interface UseRealtimeStreakProps {
  userId?: string
  onUpdate?: (streak: StreakData) => void
  enabled?: boolean
}

export function useRealtimeStreak({ userId, onUpdate, enabled = true }: UseRealtimeStreakProps) {
  const [streak, setStreak] = useState<StreakData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!enabled) return

    let channel: RealtimeChannel

    const fetchInitialData = async () => {
      try {
        setLoading(true)
        let query = supabase.from('streak').select('*')

        if (userId) {
          query = query.eq('user_id', userId)
        }

        const { data, error: fetchError } = await query.single()

        if (fetchError) throw fetchError

        setStreak(data)
        setError(null)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    const setupRealtimeSubscription = () => {
      channel = supabase.channel('streak-changes')

      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'streak',
          ...(userId && { filter: `user_id=eq.${userId}` }),
        },
        (payload) => {
          const newStreak = payload.new as StreakData
          setStreak(newStreak)
          onUpdate?.(newStreak)
        }
      )

      channel.on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'streak',
          ...(userId && { filter: `user_id=eq.${userId}` }),
        },
        (payload) => {
          const updatedStreak = payload.new as StreakData
          setStreak(updatedStreak)
          onUpdate?.(updatedStreak)
        }
      )

      channel.on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'streak',
          ...(userId && { filter: `user_id=eq.${userId}` }),
        },
        () => {
          setStreak(null)
        }
      )

      channel.subscribe()
    }

    fetchInitialData()
    setupRealtimeSubscription()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [userId, enabled, onUpdate, supabase])

  return { streak, loading, error }
}
