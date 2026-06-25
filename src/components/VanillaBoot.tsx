"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    bootAnywhereCompass?: () => void;
    bootPinPicker?: () => void;
  }
}

type VanillaBootProps = {
  kind: "compass" | "pin-picker";
  bootKey: string;
};

function runBoot(kind: VanillaBootProps["kind"]) {
  if (kind === "compass") {
    window.bootAnywhereCompass?.();
    return !!window.bootAnywhereCompass;
  }
  window.bootPinPicker?.();
  return !!window.bootPinPicker;
}

export function VanillaBoot({ kind, bootKey }: VanillaBootProps) {
  useEffect(() => {
    if (runBoot(kind)) return;

    var attempts = 0;
    var timer = window.setInterval(function () {
      attempts += 1;
      if (runBoot(kind) || attempts > 40) {
        window.clearInterval(timer);
      }
    }, 50);

    return function () {
      window.clearInterval(timer);
    };
  }, [kind, bootKey]);

  return null;
}
