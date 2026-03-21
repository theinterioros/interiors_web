"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function LandingScrollAnimations({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return;

    const sections = document.querySelectorAll("main section");
    const blobs = document.querySelectorAll("[data-parallax-blob]");
    const heroChips = document.querySelectorAll(".landing-chip");
    const primaryCtas = document.querySelectorAll(".landing-primary-cta");

    // Section entrance: fade up with stagger for inner content
    sections.forEach((section) => {
      const inner = section.querySelector(".page-inner, .section-tight");
      gsap.fromTo(
        section,
        { opacity: 0, y: 48 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            end: "top 20%",
            toggleActions: "play none none none",
          },
        }
      );
      if (inner) {
        gsap.fromTo(
          inner,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: 0.15,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    });

    // Contact block: stagger form column + contact column
    const contactBlock = document.querySelector("[data-contact-block]");
    if (contactBlock) {
      const cols = contactBlock.querySelectorAll(":scope > div");
      gsap.fromTo(
        cols,
        { opacity: 0, x: (i) => (i === 0 ? -24 : 24) },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: contactBlock,
            start: "top 82%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    // Trust built in: stagger grid items
    const trustGrid = document.querySelector("[data-trust-grid]");
    if (trustGrid) {
      const items = trustGrid.querySelectorAll(".trust-item");
      gsap.fromTo(
        items,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: trustGrid,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    // Subtle parallax on background blobs
    blobs.forEach((blob) => {
      gsap.to(blob, {
        yPercent: -20,
        ease: "none",
        scrollTrigger: {
          trigger: "main",
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
        },
      });
    });

    // Hero chips: quick stagger to make first fold feel alive
    if (heroChips.length > 0) {
      gsap.fromTo(
        heroChips,
        { opacity: 0, y: 12, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.42,
          ease: "power2.out",
          stagger: 0.05,
          scrollTrigger: {
            trigger: sections[0] ?? "main",
            start: "top 90%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    // Top progress indicator for long-page orientation
    ScrollTrigger.create({
      trigger: "main",
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        document.documentElement.style.setProperty("--landing-scroll-progress", `${Math.round(self.progress * 100)}`);
      },
      onLeaveBack: () => {
        document.documentElement.style.setProperty("--landing-scroll-progress", "0");
      },
    });

    // Subtle CTA pulse loop (non-transforming for readability)
    primaryCtas.forEach((cta) => {
      gsap.to(cta, {
        boxShadow: "0 10px 24px rgba(0, 82, 204, 0.28)",
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
      document.documentElement.style.setProperty("--landing-scroll-progress", "0");
      gsap.killTweensOf(primaryCtas);
    };
  }, []);

  return <>{children}</>;
}
