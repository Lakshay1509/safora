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
      .select("*")
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
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications((prev) => [newNotification, ...prev]);
          if (newNotification.is_read === 0) setUnreadCount((prev) => prev + 1);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const updatedNotification = payload.new as Notification;
          setNotifications((prev) =>
            prev.map((n) => (n.id === updatedNotification.id ? updatedNotification : n))
          );
         
          setUnreadCount((prev) => {
            const currentNotifications = notifications.map((n) => 
              n.id === updatedNotification.id ? updatedNotification : n
            );
            return currentNotifications.filter((n) => n.is_read === 0).length;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: 1 } : n))
    );
    setUnreadCount((prev) => Math.max(prev - 1, 0));

    const { error } = await supabase.from("notifications").update({ is_read: 1 }).eq("id", notificationId);
    if (error) console.error("Error marking notification as read:", error);
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    setUnreadCount(0);

    if (!user) return;

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: 1 })
      .eq("user_id", user.id)
      .eq("is_read", 0);

    if (error) console.error("Error marking all notifications as read:", error);
  };

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead };
}
