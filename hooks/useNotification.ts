// hooks/useNotifications.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Notification {
  id: string;
  user_id: string;
  sender_id: string;
  text: string;
  is_read: number;
  created_at: string;
}


let globalNotifications: Notification[] = [];
let globalUnreadCount = 0;
let globalChannel: RealtimeChannel | null = null;
let currentUserId: string | null = null;
let subscribers = 0;
let stateUpdateCallbacks: Array<() => void> = [];

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { user } = useAuth();

  
  const updateLocalState = useCallback(() => {
    setNotifications([...globalNotifications]);
    setUnreadCount(globalUnreadCount);
    setLoading(false);
  }, []);

  const fetchNotifications = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    //console.log("Fetching notifications for user:", user.id);
    setLoading(true);

    const { data, error } = await supabase
      .from("notifications")
      .select("*, sender:users!sender_id(id, name, profile_url)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching notifications:", error);
      setLoading(false);
      return;
    }
    
    //console.log("Fetched notifications:", data?.length || 0);
    
    // Update global state
    globalNotifications = data || [];
    
    // Calculate unread count
    const unreadItems = globalNotifications.filter(n => n.is_read === 0 );
    console.log("Unread notifications count:", unreadItems.length);
    globalUnreadCount = unreadItems.length;
    
    // Update all components using this hook
    stateUpdateCallbacks.forEach(callback => callback());
  };

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    // Add this component's state update function to the callback list
    stateUpdateCallbacks.push(updateLocalState);
    
    // If we already have notifications and same user, use them immediately
    if (globalNotifications.length > 0 && currentUserId === user.id) {
      updateLocalState();
    } else {
      // Otherwise fetch fresh data
      fetchNotifications();
    }

    // Setup a global persistent subscription
    if (!globalChannel || currentUserId !== user.id) {
      // Clean up existing channel if user changed
      if (globalChannel && currentUserId !== user.id) {
        console.log("User changed, removing old channel");
        supabase.removeChannel(globalChannel);
        globalChannel = null;
        globalNotifications = [];
        globalUnreadCount = 0;
      }

      currentUserId = user.id;
      
      globalChannel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log("Notification INSERT detected:", payload);
            fetchNotifications();
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log("Notification UPDATE detected:", payload);
            fetchNotifications();
          }
        )
        .subscribe((status) => {
          console.log(`Realtime subscription status: ${status}`);
        });
    }
    
    // Increment subscriber count
    subscribers++;
    
    return () => {
      // Remove this component's callback when unmounting
      stateUpdateCallbacks = stateUpdateCallbacks.filter(cb => cb !== updateLocalState);
      
      // Only remove the channel when all subscribers are gone
      subscribers--;
      //console.log(`Component unmounted. Remaining subscribers: ${subscribers}`);
      
      if (subscribers === 0 && globalChannel) {
        console.log("All subscribers gone, cleaning up notification channel");
        supabase.removeChannel(globalChannel);
        globalChannel = null;
        currentUserId = null;
        globalNotifications = [];
        globalUnreadCount = 0;
      }
    };
  }, [user, updateLocalState]);

  const markAsRead = async (notificationId: string) => {
    //console.log(`Marking notification ${notificationId} as read`);
    
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: 1 })
      .eq("id", notificationId);

    if (error) {
      console.error("Error marking notification as read:", error);
    } else {
      console.log("Successfully marked as read, refreshing data");
      await fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    //console.log("Marking all notifications as read");
   
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: 1 })
      .eq("user_id", user.id)
      .eq("is_read", 0);

    if (error) {
      console.error("Error marking all notifications as read:", error);
    } else {
      console.log("Successfully marked all as read, refreshing data");
      await fetchNotifications();
    }
  };

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead };
}
