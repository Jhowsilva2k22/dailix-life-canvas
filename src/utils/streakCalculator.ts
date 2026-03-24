/**
 * Streak calculator for habits.
 * Uses the user's local date to avoid UTC drift.
 */

/** Returns YYYY-MM-DD for the user's local timezone */
export function localDateStr(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Subtract N days from a local date string and return new local date string */
function subtractDays(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - n);
  return localDateStr(dt);
}

export interface StreakResult {
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate: string | null;
}

/**
 * Calculate streak from an array of completed date strings (YYYY-MM-DD).
 * Dates should already be filtered for a single habit.
 */
export function calculateStreak(completedDates: string[]): StreakResult {
  if (completedDates.length === 0) {
    return { currentStreak: 0, bestStreak: 0, lastCompletedDate: null };
  }

  // Deduplicate and sort descending
  const unique = [...new Set(completedDates)].sort((a, b) => (a > b ? -1 : 1));
  const lastCompletedDate = unique[0];

  const today = localDateStr();
  const yesterday = subtractDays(today, 1);

  // Current streak: count consecutive days starting from today or yesterday
  let currentStreak = 0;
  if (unique[0] === today || unique[0] === yesterday) {
    let expected = unique[0];
    for (const date of unique) {
      if (date === expected) {
        currentStreak++;
        expected = subtractDays(expected, 1);
      } else if (date < expected) {
        // gap found
        break;
      }
    }
  }

  // Best streak: find longest consecutive run in history
  let bestStreak = 0;
  let run = 1;
  for (let i = 1; i < unique.length; i++) {
    const expectedPrev = subtractDays(unique[i - 1], 1);
    if (unique[i] === expectedPrev) {
      run++;
    } else {
      run = 1;
    }
    if (run > bestStreak) bestStreak = run;
  }
  // Account for single-element or last run
  if (unique.length === 1) bestStreak = 1;
  else if (run > bestStreak) bestStreak = run;
  // First element run
  if (1 > bestStreak) bestStreak = 1;

  if (currentStreak > bestStreak) bestStreak = currentStreak;

  return { currentStreak, bestStreak, lastCompletedDate };
}
