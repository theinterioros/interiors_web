"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type CitySelectProps = {
  name: string;
  id?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  defaultValue?: string;
};

export default function CitySelect({
  name,
  id,
  required,
  placeholder = "Select city",
  className = "input",
  defaultValue = "",
}: CitySelectProps) {
  const [cities, setCities] = useState<string[]>([]);
  const [query, setQuery] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/cities/india")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.cities)) setCities(data.cities);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = query.trim()
    ? cities.filter((c) => c.toLowerCase().includes(query.toLowerCase())).slice(0, 200)
    : cities;

  const selectCity = useCallback((city: string) => {
    setQuery(city);
    setOpen(false);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full min-w-0">
      <input
        type="text"
        id={id}
        name={name}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        required={required}
        placeholder={loading ? "Loading cities…" : placeholder}
        className={className}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open}
        role="combobox"
      />
      {open && (
        <ul
          className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-[var(--border)] bg-white py-1 shadow-lg"
          role="listbox"
        >
          {filtered.length === 0 ? (
            <li className="px-4 py-2 text-sm text-[var(--text-muted)]">No city found</li>
          ) : (
            filtered.map((city) => (
              <li
                key={city}
                role="option"
                tabIndex={0}
                className="cursor-pointer px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-subtle)]"
                onMouseDown={() => selectCity(city)}
              >
                {city}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
