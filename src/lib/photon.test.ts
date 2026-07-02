import { describe, expect, it } from "vitest";
import {
  formatPhotonName,
  parsePhotonReverse,
  parsePhotonSearch,
} from "@/lib/photon";

describe("Photon response parsing", () => {
  it("deduplicates display-name parts", () => {
    expect(
      formatPhotonName({
        name: "Edmonton",
        city: "Edmonton",
        state: "Alberta",
        country: "Canada",
      }),
    ).toBe("Edmonton, Alberta, Canada");
  });

  it("drops results with invalid coordinates", () => {
    const results = parsePhotonSearch({
      features: [
        {
          properties: { name: "Valid" },
          geometry: { coordinates: [-113.4938, 53.5461] },
        },
        {
          properties: { name: "Invalid" },
          geometry: { coordinates: [200, 100] },
        },
      ],
    });

    expect(results).toEqual([
      { lat: 53.5461, lng: -113.4938, name: "Valid" },
    ]);
  });

  it("rejects an invalid reverse-geocode result", () => {
    expect(
      parsePhotonReverse({
        features: [
          {
            properties: { name: "Invalid" },
            geometry: { coordinates: [200, 100] },
          },
        ],
      }),
    ).toBeNull();
  });
});
