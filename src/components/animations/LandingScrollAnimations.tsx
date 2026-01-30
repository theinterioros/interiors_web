"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function LandingScrollAnimations({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const sections = document.querySelectorAll("main section");
    const blobs = document.querySelectorAll("[data-parallax-blob]");

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

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return <>{children}</>;
}
