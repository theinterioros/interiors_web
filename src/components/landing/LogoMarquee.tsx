type Firm = {
  id: string;
  name: string;
  mark: string;
  logoBg: string;
};

export default function LogoMarquee({ firms }: { firms: Firm[] }) {
  const doubled = [...firms, ...firms];
  return (
    <div className="landing-logoMarquee" aria-label="Trusted by studios">
      <div className="landing-logoMarqueeTrack">
        {doubled.map((firm, idx) => (
          <div
            key={`${firm.id}-${idx}`}
            className="landing-logoMarqueeItem"
            aria-hidden={idx >= firms.length}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${firm.logoBg} text-white text-xs font-semibold tracking-tight`}
              aria-hidden
            >
              {firm.mark}
            </div>
            <span className="text-sm text-[var(--foreground)] font-medium whitespace-nowrap">{firm.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
