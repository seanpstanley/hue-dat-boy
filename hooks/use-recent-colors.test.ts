// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const STORAGE_KEY = "hue-dat-boy:recent-colors";

// The store caches the list at module level, so each test gets a fresh copy of the module
async function loadStore() {
  vi.resetModules();
  return import("./use-recent-colors");
}

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe("useRecentColors", () => {
  it("starts empty", async () => {
    const { useRecentColors } = await loadStore();
    const { result } = renderHook(() => useRecentColors());
    expect(result.current).toEqual([]);
  });

  it("updates subscribers, newest first, without duplicates", async () => {
    const { addRecentColor, useRecentColors } = await loadStore();
    const { result } = renderHook(() => useRecentColors());

    act(() => {
      addRecentColor("#111111");
      addRecentColor("#222222");
      addRecentColor("#111111");
    });

    expect(result.current).toEqual(["#111111", "#222222"]);
  });

  it("keeps the 8 most recent colors", async () => {
    const { addRecentColor, useRecentColors } = await loadStore();
    for (let i = 0; i < 10; i++) addRecentColor(`#00000${i}`);

    const { result } = renderHook(() => useRecentColors());
    expect(result.current).toHaveLength(8);
    expect(result.current[0]).toBe("#000009");
  });

  it("persists to localStorage and reads it back", async () => {
    (await loadStore()).addRecentColor("#abcdef");
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual(["#abcdef"]);

    const { useRecentColors } = await loadStore();
    const { result } = renderHook(() => useRecentColors());
    expect(result.current).toEqual(["#abcdef"]);
  });

  it("ignores corrupt or invalid stored values", async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(["#abcdef", 42, "nope"]));
    const { useRecentColors } = await loadStore();
    const { result } = renderHook(() => useRecentColors());
    expect(result.current).toEqual(["#abcdef"]);

    localStorage.setItem(STORAGE_KEY, "{not json");
    const fresh = await loadStore();
    expect(renderHook(() => fresh.useRecentColors()).result.current).toEqual(
      [],
    );
  });

  it("still works when storage is unavailable", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const { addRecentColor, useRecentColors } = await loadStore();

    addRecentColor("#123456");
    const { result } = renderHook(() => useRecentColors());
    expect(result.current).toEqual(["#123456"]);
  });
});
