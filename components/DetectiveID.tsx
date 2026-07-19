// Lanyard-clipped detective ID badge.
// Visual reference: components/DetectiveID.dc.html in the design tokens project.

const BARCODE_WIDTHS = [2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 2, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3];

export function DetectiveID({
  detectiveName = "A. Reyes",
  title = "Senior Detective",
  badgeNumber = "GD-0417",
  joinDate = "Est. 2021",
  avatarTint = "var(--secondary-noir)",
}: {
  detectiveName?: string;
  title?: string;
  badgeNumber?: string;
  joinDate?: string;
  avatarTint?: string;
}) {
  return (
    <div className="inline-flex flex-col items-center font-officials">
      <div
        className="w-[46px] h-[120px] rounded-t-sm shadow-[inset_0_0_6px_rgba(0,0,0,0.6)]"
        style={{ background: "repeating-linear-gradient(90deg,#17140f 0 4px,#221e17 4px 8px)" }}
      />
      <div
        className="relative z-10 w-[34px] h-4 rounded -mt-0.5"
        style={{
          background: "linear-gradient(180deg,#cfcfcf,#8a8a8a)",
          boxShadow: "0 2px 3px rgba(0,0,0,0.5)",
        }}
      />
      <div className="w-[220px] box-border bg-aged-paper-light rounded-md -mt-1.5 p-5 shadow-lifted">
        <div className="mb-2.5 text-center text-[10px] font-semibold tracking-widest text-crime-scene-red">
          {title.toUpperCase()}
        </div>
        <div className="flex gap-3">
          <div
            className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-sm border-2 border-ink"
            style={{ background: avatarTint }}
          >
            <div className="absolute left-1/2 top-2 h-7 w-7 -translate-x-1/2 rounded-full bg-black/35" />
            <div className="absolute bottom-0 left-1/2 h-[26px] w-11 -translate-x-1/2 rounded-t-full bg-black/35" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[15px] font-semibold text-ink">{detectiveName}</div>
            <div className="mt-1 text-[10px] text-ink/65">Badge No.</div>
            <div className="text-xs font-medium text-ink">{badgeNumber}</div>
            <div className="mt-1 text-[10px] text-ink/65">{joinDate}</div>
          </div>
        </div>
        <div className="mt-3.5 flex items-end justify-between border-t border-dashed border-black/20 pt-2.5">
          <div className="flex h-[22px] gap-px">
            {BARCODE_WIDTHS.map((w, i) => (
              <div key={i} style={{ width: w, background: "var(--ink)" }} />
            ))}
          </div>
          <div
            className="h-[34px] w-[34px] border-2 border-ink"
            style={{
              backgroundColor: "var(--bone)",
              backgroundImage:
                "repeating-linear-gradient(90deg, var(--ink) 0 2px, transparent 2px 4px), repeating-linear-gradient(0deg, var(--ink) 0 2px, transparent 2px 4px)",
              backgroundSize: "6px 6px",
            }}
          />
        </div>
      </div>
    </div>
  );
}
