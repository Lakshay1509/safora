"use server";

import { cookies } from "next/headers";
import { db } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

interface LocationHistory {
  id: string;
  name: string;
  visitedAt: string;
}

const DAILY_VIEWS_COOKIE = "daily_location_views";
const MAX_DAILY_VIEWS = 30; // Limit total entries

interface DailyView {
  location_id: string;
  view_date: string; // YYYY-MM-DD format
  synced: boolean;
}

const MAX_HISTORY_ITEMS = 5;
const COOKIE_NAME = "location_history";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

// Server Action to add location to history
export async function addLocationToHistory(locationId: string, locationName: string) {
  "use server";
  
  const cookieStore = await cookies();
  
  // Get existing history
  const existingHistory = cookieStore.get(COOKIE_NAME)?.value;
  let history: LocationHistory[] = existingHistory ? JSON.parse(existingHistory) : [];
  
  // Remove duplicate if exists
  history = history.filter(item => item.id !== locationId);
  
  // Add new location at the beginning
  history.unshift({
    id: locationId,
    name: locationName,
    visitedAt: new Date().toISOString(),
  });
  
  // Keep only the most recent items
  history = history.slice(0, MAX_HISTORY_ITEMS);
  
  // Save back to cookie
  cookieStore.set(COOKIE_NAME, JSON.stringify(history), {
    maxAge: COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
    httpOnly: false, // Allow client-side access if needed
  });
  
  return history;
}

export async function getLocationHistory(): Promise<LocationHistory[]> {
  const cookieStore = await cookies();
  const history = cookieStore.get(COOKIE_NAME)?.value;
  
  return history ? JSON.parse(history) : [];
}

export async function clearLocationHistory() {
  "use server";
  
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}


export async function trackLocationView(
  locationId: string,
) {
  "use server";

  const cookieStore = await cookies();
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const existingData = cookieStore.get(DAILY_VIEWS_COOKIE)?.value;
  let views: DailyView[] = existingData ? JSON.parse(existingData) : [];

  // Remove old views (older than 3 days)
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  views = views.filter(
    (v) => v.view_date >= threeDaysAgo.toISOString().split("T")[0]
  );

  // Limit total entries to prevent cookie overflow
  if (views.length >= MAX_DAILY_VIEWS) {
    views = views.slice(-MAX_DAILY_VIEWS + 1); // Keep most recent, make room for new entry
  }

  const existingView = views.find(
    (v) => v.location_id === locationId && v.view_date === today
  );
  let isNewView = false;

  if (!existingView) {
    const newView: DailyView = {
      location_id: locationId,
      view_date: today,
      synced: false,
    };
    views.push(newView);
    isNewView = true;

    await syncViewsToDatabase([newView]);
    newView.synced = true;
  }

  // Save updated views to cookie
  cookieStore.set(DAILY_VIEWS_COOKIE, JSON.stringify(views), {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
    sameSite: "lax",
  });

  return { views, isNewView };
}

async function syncViewsToDatabase(views: DailyView[]) {
  try {
    // Get authenticated user from Supabase
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
     
      return;
    }

    // Directly insert into database instead of making HTTP request
    await db.location_daily_views.createMany({
      data: views.map((view) => ({
        user_id: user.id,
        location_id: view.location_id,
        view_date: new Date(view.view_date),
      })),
      skipDuplicates: true,
    });

    
  } catch (error) {
    console.error("Failed to sync daily views:", error);
  }
}

const ANONYMOUS_VIEWS_COOKIE = "anonymous_precaution_views";
const MAX_ANONYMOUS_VIEWS = 2;

interface AnonymousView {
  location_id: string;
  viewed_at: string;
}

export async function trackAnonymousPrecautionView(locationId: string): Promise<{ allowed: boolean; viewCount: number }> {
  "use server";
  
  const cookieStore = await cookies();
  const existingData = cookieStore.get(ANONYMOUS_VIEWS_COOKIE)?.value;
  let views: AnonymousView[] = existingData ? JSON.parse(existingData) : [];
  
  // Check if this location was already viewed
  const alreadyViewed = views.some(v => v.location_id === locationId);
  
  if (!alreadyViewed) {
    // Check if limit reached
    if (views.length >= MAX_ANONYMOUS_VIEWS) {
      return { allowed: false, viewCount: views.length };
    }
    
    // Add new view
    views.push({
      location_id: locationId,
      viewed_at: new Date().toISOString(),
    });
    
    // Save to cookie
    cookieStore.set(ANONYMOUS_VIEWS_COOKIE, JSON.stringify(views), {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
      sameSite: "lax",
    });
  }
  
  return { allowed: true, viewCount: views.length };
}

export async function getAnonymousViewCount(): Promise<number> {
  "use server";
  
  const cookieStore = await cookies();
  const existingData = cookieStore.get(ANONYMOUS_VIEWS_COOKIE)?.value;
  const views: AnonymousView[] = existingData ? JSON.parse(existingData) : [];
  
  return views.length;
}