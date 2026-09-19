"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const ROTATION_COUNT = 1;
const ROTATION_DURATION = 0.8; // Durasi santai & halus

export default function LoadingScreen() {
  const [isMounted, setIsMounted] = useState(true);
  const overlayRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    // 1. Animasi 3 putaran penuh (3 x 360 = 1080 deg) dengan pergerakan santai & halus
    let rotationTween: gsap.core.Tween | null = null;
    const rotationPromise = new Promise<void>((resolve) => {
      if (iconRef.current) {
        rotationTween = gsap.to(iconRef.current, {
          rotation: 360 * ROTATION_COUNT,
          duration: ROTATION_DURATION,
          ease: "sine.inOut",
          onComplete: () => resolve(),
        });
      } else {
        resolve();
      }
    });

    // 2. Kesiapan DOM / aset halaman
    const windowReady = new Promise<void>((resolve) => {
      if (typeof document !== "undefined" && (document.readyState === "complete" || document.readyState === "interactive")) {
        resolve();
        return;
      }
      const onLoad = () => {
        resolve();
        window.removeEventListener("load", onLoad);
      };
      window.addEventListener("load", onLoad);
    });

    // Wait for both animation AND window ready (or timeout)
    // Removed artificial delay - now uses Promise.race with both conditions
    const ready = Promise.all([rotationPromise, windowReady]);

    ready.then(() => {
      if (!overlayRef.current) return;
      gsap.to(overlayRef.current, {
        opacity: 0,
        scale: 1.05,
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: () => {
          document.body.style.overflow = "";
          setIsMounted(false);
          window.dispatchEvent(new CustomEvent("landing-ready"));
        },
      });
    });

    return () => {
      rotationTween?.kill();
      document.body.style.overflow = "";
    };
  }, []);

  if (!isMounted) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={iconRef}
        src="/assets/recycle-icon-animation.svg"
        alt="Loading..."
        className="h-40 w-40 opacity-80 sm:h-48 sm:w-48"
      />
    </div>
  );
}
