import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { calculateStreak, localDateStr } from "./streakCalculator";

// Helper: freeze "today" to a known date
function fakeToday(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  vi.useFakeTimers();
  vi.setSystemTime(new Date(y, m - 1, d, 12, 0, 0)); // noon local
}

afterEach(() => vi.useRealTimers());

describe("localDateStr", () => {
  it("returns YYYY-MM-DD for local date", () => {
    fakeToday("2026-03-24");
    expect(localDateStr()).toBe("2026-03-24");
  });
});

describe("calculateStreak", () => {
  // Scenario 1: First completion today → streak = 1
  it("first completion today → streak = 1", () => {
    fakeToday("2026-03-24");
    const result = calculateStreak(["2026-03-24"]);
    expect(result.currentStreak).toBe(1);
    expect(result.bestStreak).toBe(1);
    expect(result.lastCompletedDate).toBe("2026-03-24");
  });

  // Scenario 2: Consecutive days → streak increments
  it("consecutive days → streak increments correctly", () => {
    fakeToday("2026-03-24");
    const dates = ["2026-03-24", "2026-03-23", "2026-03-22", "2026-03-21"];
    const result = calculateStreak(dates);
    expect(result.currentStreak).toBe(4);
    expect(result.bestStreak).toBe(4);
  });

  it("3 consecutive ending yesterday → streak = 3 (still alive)", () => {
    fakeToday("2026-03-24");
    const dates = ["2026-03-23", "2026-03-22", "2026-03-21"];
    const result = calculateStreak(dates);
    expect(result.currentStreak).toBe(3);
  });

  // Scenario 3: Skip a day → streak breaks
  it("skip a day → streak breaks, restarts", () => {
    fakeToday("2026-03-24");
    // completed today + skipped 23rd + completed 22,21,20
    const dates = ["2026-03-24", "2026-03-22", "2026-03-21", "2026-03-20"];
    const result = calculateStreak(dates);
    expect(result.currentStreak).toBe(1); // only today
    expect(result.bestStreak).toBe(3);    // 20,21,22
  });

  // Scenario 4: Undo today → recalculate from history
  it("undo today, yesterday streak still alive", () => {
    fakeToday("2026-03-24");
    // Was: today + yesterday + day before. After undo today:
    const dates = ["2026-03-23", "2026-03-22"];
    const result = calculateStreak(dates);
    expect(result.currentStreak).toBe(2); // yesterday + day before, still alive
    expect(result.bestStreak).toBe(2);
  });

  it("undo today, last completion was 3 days ago → streak = 0", () => {
    fakeToday("2026-03-24");
    const dates = ["2026-03-21", "2026-03-20"];
    const result = calculateStreak(dates);
    expect(result.currentStreak).toBe(0); // too old
    expect(result.bestStreak).toBe(2);
  });

  // Scenario 5: Duplicate same day → no inflation
  it("duplicate dates do not inflate streak", () => {
    fakeToday("2026-03-24");
    const dates = ["2026-03-24", "2026-03-24", "2026-03-23", "2026-03-23"];
    const result = calculateStreak(dates);
    expect(result.currentStreak).toBe(2);
    expect(result.bestStreak).toBe(2);
  });

  // Empty
  it("empty dates → streak = 0", () => {
    const result = calculateStreak([]);
    expect(result.currentStreak).toBe(0);
    expect(result.bestStreak).toBe(0);
    expect(result.lastCompletedDate).toBeNull();
  });

  // Best streak preserved from past
  it("best streak from past is preserved even when current is lower", () => {
    fakeToday("2026-03-24");
    // 5-day streak in the past, then gap, then 2-day current
    const dates = [
      "2026-03-24", "2026-03-23",
      // gap on 22
      "2026-03-15", "2026-03-14", "2026-03-13", "2026-03-12", "2026-03-11",
    ];
    const result = calculateStreak(dates);
    expect(result.currentStreak).toBe(2);
    expect(result.bestStreak).toBe(5);
  });
});
