import { describe, expect, it } from "vitest";
import { isValidCoordinate, parseToParam } from "@/lib/target-url";

describe("coordinate validation", () => {
  it("accepts valid coordinate pairs", () => {
    expect(parseToParam("53.5461,-113.4938")).toEqual({
      lat: 53.5461,
      lng: -113.4938,
    });
    expect(parseToParam(" -90 , 180 ")).toEqual({ lat: -90, lng: 180 });
  });

  it("rejects malformed and out-of-range coordinate pairs", () => {
    expect(parseToParam("53.5")).toBeNull();
    expect(parseToParam("53.5,-113.5,10")).toBeNull();
    expect(parseToParam("53north,-113west")).toBeNull();
    expect(parseToParam("Infinity,0")).toBeNull();
    expect(parseToParam("91,0")).toBeNull();
    expect(parseToParam("0,181")).toBeNull();
  });

  it("requires finite latitude and longitude values", () => {
    expect(isValidCoordinate(0, 0)).toBe(true);
    expect(isValidCoordinate(Number.NaN, 0)).toBe(false);
    expect(isValidCoordinate(0, Number.POSITIVE_INFINITY)).toBe(false);
  });
});
