/**
 * NFL Season utility functions
 */

export function getCurrentNFLWeek(): number {
  // NFL 2025 season starts on September 4, 2025 (Thursday Night Football)
  // Week 1 games primarily on September 7-8, 2025 (Sunday)
  const season2025Start = new Date("2025-09-04T00:00:00-04:00"); // EDT
  const currentDate = new Date();

  // If we're before the season starts, return week 1
  if (currentDate < season2025Start) {
    return 1;
  }

  // Calculate weeks since season start
  const timeDiff = currentDate.getTime() - season2025Start.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

  // NFL weeks are generally Thursday to Wednesday
  // Week 1: Sept 4-10, Week 2: Sept 11-17, etc.
  const weekNumber = Math.floor(daysDiff / 7) + 1;

  // Cap at week 18 (regular season ends)
  return Math.min(weekNumber, 18);
}

export function getNFLWeekDateRange(week: number): { start: Date; end: Date } {
  const season2025Start = new Date("2025-09-04T00:00:00-04:00"); // EDT

  // Calculate the start of the given week
  const weekStart = new Date(season2025Start);
  weekStart.setDate(weekStart.getDate() + (week - 1) * 7);

  // End of week is 6 days later
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return { start: weekStart, end: weekEnd };
}

export function formatNFLWeekDisplay(week: number): string {
  const { start, end } = getNFLWeekDateRange(week);
  const formatOptions: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };

  return `Week ${week} (${start.toLocaleDateString(
    "en-US",
    formatOptions
  )} - ${end.toLocaleDateString("en-US", formatOptions)})`;
}
