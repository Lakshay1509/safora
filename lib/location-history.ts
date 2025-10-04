"use server";

import { cookies } from "next/headers";

interface LocationHistory {
  id: string;
  name: string;
  visitedAt: string;
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