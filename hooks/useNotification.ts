// hooks/useNotifications.ts

"use client";

import { useEffect, useState } from "react";
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

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { user } = useAuth();

  const fetchNotifications = async () => {
    if (!user) return setLoading(false);

    setLoading(true);

    const { data, error } = await supabase
      .from("notifications")
      .select("*, sender:users!sender_id(id, name, profile_url)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) console.error("Error fetching notifications:", error);
    else {
      setNotifications(data || []);
      setUnreadCount(data?.filter((n) => n.is_read === 0).length || 0);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    fetchNotifications();

    const channel: RealtimeChannel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Don't use the payload directly, as it's incomplete.
          // Refetch the entire list to ensure data consistency.
          console.log("Insert received, refetching notifications...");
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
        () => {
          // Refetch on update as well to keep all data fresh.
          console.log("Update received, refetching notifications...");
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    // First, update the backend
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: 1 })
      .eq("id", notificationId);

    if (error) {
      console.error("Error marking notification as read:", error);
    } else {
      // On success, refetch the data to ensure UI consistency
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    // First, update the backend
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: 1 })
      .eq("user_id", user.id)
      .eq("is_read", 0);

    if (error) {
      console.error("Error marking all notifications as read:", error);
    } else {
      // On success, refetch the data
      fetchNotifications();
    }
  };

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead };
}
