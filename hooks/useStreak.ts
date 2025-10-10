'use client'

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/utils/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

export interface StreakData {
    id: string,
    count: number,
    created_at?: string,
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
  const channelRef = useRef<RealtimeChannel | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // console.log('🔄 useRealtimeStreak - Effect triggered', { userId, enabled });
    
    if (!enabled) {
      // console.log('⏸️ useRealtimeStreak - Disabled, skipping');
      setLoading(false);
      return;
    }

    if (!userId) {
      // console.log('⚠️ No userId provided, skipping subscription');
      setLoading(false);
      return;
    }

    const fetchInitialData = async () => {
      // console.log('📥 Fetching initial streak data for userId:', userId);
      
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('streak')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (fetchError) {
          // console.error('❌ Error fetching initial data:', fetchError);
          throw fetchError;
        }
        
        // console.log('✅ Initial data fetched successfully:', data);
        setStreak(data);
        setError(null);
      } catch (err) {
        // console.error('💥 Exception in fetchInitialData:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
        // console.log('✅ Initial data fetch complete');
      }
    }

    const setupRealtimeSubscription = () => {
      // console.log('🔌 Setting up realtime subscription for userId:', userId);
      
      if (channelRef.current) {
        // console.log('🧹 Removing existing channel before creating new one');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      const channelName = `streak-changes-${userId}-${Date.now()}`;
      const channel = supabase.channel(channelName, {
        config: {
          broadcast: { self: true },
          presence: { key: userId },
        },
      });

      channelRef.current = channel;

      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'streak',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // console.log('🆕 INSERT event received:', payload);
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
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // console.log('🔄 UPDATE event received:', payload);
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
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // console.log('🗑️ DELETE event received:', payload);
          setStreak(null)
        }
      )

      channel.subscribe((status, err) => {
        // console.log('📡 Subscription status:', status);
        
        if (err) {
          // console.error('❌ Subscription error:', err);
        }
        
        switch (status) {
          case 'SUBSCRIBED':
            // console.log('✅ Successfully subscribed to realtime updates');
            if (reconnectTimeoutRef.current) {
              clearTimeout(reconnectTimeoutRef.current);
              reconnectTimeoutRef.current = null;
            }
            break;
            
          case 'CHANNEL_ERROR':
            // console.error('❌ Channel error occurred, attempting to reconnect...');
            attemptReconnect();
            break;
            
          case 'TIMED_OUT':
            // console.error('⏰ Subscription timed out, attempting to reconnect...');
            attemptReconnect();
            break;
            
          case 'CLOSED':
            // console.warn('🔒 Channel closed, attempting to reconnect...');
            attemptReconnect();
            break;
        }
      })
    }

    const attemptReconnect = () => {
      // console.log('🔄 Scheduling reconnect attempt in 3 seconds...');
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      reconnectTimeoutRef.current = setTimeout(() => {
        // console.log('🔄 Attempting to reconnect...');
        setupRealtimeSubscription();
      }, 3000);
    }

    fetchInitialData();
    setupRealtimeSubscription();

    return () => {
      // console.log('🧹 Cleaning up realtime subscription');
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        // console.log('✅ Channel removed');
      }
    }
  }, [userId, enabled]);

  return { streak, loading, error }
}
