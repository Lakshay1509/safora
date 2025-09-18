export function estimateReadingTime(body: string|undefined, wordsPerMinute: number = 200): number {
  if (!body) return 0;

  // Split body into words
  const words = body.trim().split(/\s+/).length;

  // Calculate time in minutes
  const time = words / wordsPerMinute;

  // Round up to nearest minute
  return Math.ceil(time);
}