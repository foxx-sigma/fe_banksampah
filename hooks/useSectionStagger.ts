"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const STAGGER_PRESET: gsap.StaggerVars = {
  from: "edges",
  axis: undefined,
  ease: "power2.in",
  each: 0.05,
};

type StaggerGroup = {
  selector: string;
  fromVars?: gsap.TweenVars;
  toVars?: gsap.TweenVars;
  position?: string;
};

type UseSectionStaggerOptions = {
  groups: StaggerGroup[];
  triggerStart?: string;
  triggerEnd?: string;
  skipScrollTrigger?: boolean;
};

const DEFAULT_FROM: gsap.TweenVars = {
  opacity: 0,
  y: 30,
  scale: 0.92,
};

const DEFAULT_TO: gsap.TweenVars = {
  opacity: 1,
  y: 0,
  scale: 1,
  duration: 0.5,
  ease: "power2.out",
};

export function useSectionStagger(options: UseSectionStaggerOptions) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        paused: true,
        scrollTrigger: options.skipScrollTrigger
          ? undefined
          : {
              trigger: container,
              start: options.triggerStart ?? "top 80%",
              end: options.triggerEnd ?? "bottom 20%",
              toggleActions: "play reverse play reverse",
            },
      });

      options.groups.forEach((group) => {
        const elements = container.querySelectorAll(group.selector);
        if (!elements.length) return;

        tl.fromTo(
          elements,
          { ...DEFAULT_FROM, ...group.fromVars },
          {
            ...DEFAULT_TO,
            ...group.toVars,
            stagger: {
              ...STAGGER_PRESET,
              ...(group.toVars?.stagger as object),
            },
          },
          group.position ?? ">",
        );
      });

      if (options.skipScrollTrigger) {
        const play = () => {
          tl.play();
          ScrollTrigger.refresh();
        };
        window.addEventListener("landing-ready", play, { once: true });

        const fallback = setTimeout(() => {
          if (tl.progress() === 0) {
            tl.play();
            ScrollTrigger.refresh();
          }
        }, 6000);

        return () => {
          window.removeEventListener("landing-ready", play);
          clearTimeout(fallback);
        };
      }
    }, container);

    return () => ctx.revert();
  }, [options]);

  return containerRef;
}
