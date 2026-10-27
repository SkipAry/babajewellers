import type { RateHistoryEntry } from "@/lib/rateHistory";
import { trendSummary } from "@/lib/rateHistory";
import { inr } from "@/data/site";

/**
 * Seven-day 22K history.
 *
 * This is the main thing a search snippet cannot deliver: a snippet can
 * show today's rate, but not whether it has been climbing all week. That
 * is the reason to click, so it is rendered server-side at build time —
 * a client fetch would leave Googlebot looking at an empty table.
 *
 * Shows 22K only. All four purities move together, so three more columns
 * would add width on a phone without adding information.
 *
 * Renders nothing below two entries. A "trend" drawn from one point is
 * not a trend.
 */
export default function RateTrend({
  history,
  town,
}: {
  history: RateHistoryEntry[];
  town: string;
}) {
  if (history.length < 2) return null;

  const t = trendSummary(history);
  const values = history.map((h) => h["22k"]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const fmtDay = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  return (
    <>
      <h2 className="mt-12 font-display text-3xl font-bold text-maroon-deep">
        22K gold over the last {history.length} days
      </h2>

      {t ? (
        <p className="mt-4 text-base leading-relaxed text-ink/80">
          {t.direction === "flat" ? (
            <>
              The 22K rate is unchanged since {fmtDay(t.from)}, at{" "}
              <strong>{inr(values[values.length - 1])}</strong> per gram.
            </>
          ) : (
            <>
              22K has moved{" "}
              <strong>
                {t.direction === "up" ? "up" : "down"} {inr(Math.abs(t.diff))}
              </strong>{" "}
              per gram since {fmtDay(t.from)} — {Math.abs(t.pct).toFixed(1)}% in{" "}
              {t.days} days.
            </>
          )}{" "}
          On a 20-gram set that is a difference of about{" "}
          <strong>{inr(Math.abs(t.diff) * 20)}</strong> in metal alone.
        </p>
      ) : null}

      <div className="mt-6 overflow-hidden rounded-sm border border-maroon/15">
        <table className="w-full text-sm">
          <caption className="sr-only">
            22K gold rate per gram in {town}, last {history.length} days
          </caption>
          <thead>
            <tr className="bg-maroon/5">
              <th scope="col" className="px-4 py-3 text-left font-semibold text-maroon-deep">
                Date
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold text-maroon-deep">
                22K per gram
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold text-maroon-deep">
                Change
              </th>
            </tr>
          </thead>
          <tbody>
            {history.map((row, i) => {
              const prev = i > 0 ? history[i - 1]["22k"] : null;
              const delta = prev === null ? null : row["22k"] - prev;
              /* Bar width is relative to the window's own range, not to
                 zero — a ₹200 move on a ₹13,000 rate is invisible on a
                 zero-based scale, and the point here is the shape of the
                 week. */
              const pct = ((row["22k"] - min) / span) * 100;
              return (
                <tr key={row.date} className="border-t border-maroon/10">
                  <th scope="row" className="px-4 py-3 text-left font-normal text-ink/75">
                    {fmtDay(row.date)}
                  </th>
                  <td className="px-4 py-3 text-right">
                    <span className="font-display font-bold text-maroon-deep">
                      {inr(row["22k"])}
                    </span>
                    <span
                      aria-hidden="true"
                      className="mt-1 block h-1 rounded-full bg-gold/70"
                      style={{ width: `${Math.max(8, pct)}%`, marginLeft: "auto" }}
                    />
                  </td>
                  <td className="px-4 py-3 text-right text-ink/70">
                    {delta === null ? (
                      "—"
                    ) : delta === 0 ? (
                      "no change"
                    ) : (
                      <span className={delta > 0 ? "text-maroon" : "text-ink/60"}>
                        {delta > 0 ? "+" : "−"}
                        {inr(Math.abs(delta)).replace("₹", "₹")}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-ink/55">
        Published rates from our own daily record. Indicative — ask in store
        for the exact rate at the time of purchase.
      </p>
    </>
  );
}
