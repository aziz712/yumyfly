"use client";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

export default function AOSInit() {
  useEffect(() => {
    AOS.init({
      duration: 1200,
      once: true, // This makes animations repeat every time
      mirror: false, // This enables animations when scrolling back up
    });
  }, []);
  return null;
}
