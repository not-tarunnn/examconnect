"use client";

import { useEffect } from "react";
import { registerFcmSW } from "@/lib/register-sw";

export default function FCMRegistrar() {
  useEffect(() => {
    registerFcmSW();
  }, []);

  return null;
}
