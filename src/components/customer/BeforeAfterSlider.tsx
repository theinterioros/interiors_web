"use client";

import { useState } from "react";

type Props = {
  images: { id: string; blob_url: string; file_name: string }[];
};

export default function BeforeAfterSlider({ images }: Props) {
  const [sliderPos, setSliderPos] = useState(50);
  if (images.length === 0) return null;
  const beforeUrl = images[0]?.blob_url;
  const afterUrl = images.length > 1 ? images[1].blob_url : images[0].blob_url;

  return (
    <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--surface-subtle)]">
      <p className="text-xs text-[var(--text-muted)] px-3 py-2 border-b border-[var(--border)]">
        Before vs After · Slide to compare
      </p>
      <div className="relative h-56 sm:h-72">
        <div className="absolute inset-0 flex">
          <div className="relative h-full overflow-hidden" style={{ width: `${sliderPos}%` }}>
            <img
              src={beforeUrl}
              alt="Before"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            <span className="absolute left-2 top-2 rounded bg-black/60 px-2 py-1 text-xs font-medium text-white">
              Before
            </span>
          </div>
          <div className="relative h-full flex-1 overflow-hidden">
            <img
              src={afterUrl}
              alt="After"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            <span className="absolute right-2 top-2 rounded bg-black/60 px-2 py-1 text-xs font-medium text-white">
              After
            </span>
          </div>
        </div>
        <input
          type="range"
          min={10}
          max={90}
          value={sliderPos}
          onChange={(e) => setSliderPos(Number(e.target.value))}
          className="absolute inset-x-0 bottom-2 z-10 h-2 w-[calc(100%-1rem)] mx-2 rounded-full appearance-none bg-white/30 accent-[var(--brand)] cursor-pointer"
          aria-label="Compare before and after"
        />
      </div>
    </div>
  );
}
