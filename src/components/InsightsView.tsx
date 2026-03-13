"use client";

import { useRef, useState, useMemo, useId, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "motion/react";

// ─── Constants ──────────────────────────────────────────

const ACCENT = "#6e31e7";
const GREEN = "#46d08f";
const BLUE = "#2c80ff";
const RED = "#ef5350";
const YELLOW = "#ffc107";

const EASE_OUT_QUART: [number, number, number, number] = [0.25, 1, 0.5, 1];
const EASE_IN_OUT: [number, number, number, number] = [0.42, 0, 0.58, 1];

// ─── Icons ──────────────────────────────────────────────

function ChevronIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Catmull-Rom Spline ─────────────────────────────────

function catmullRomToBezier(points: { x: number; y: number }[], tension = 0.5): string {
  if (points.length < 2) return "";
  if (points.length === 2) return `M${points[0].x},${points[0].y}L${points[1].x},${points[1].y}`;

  const pts = [points[0], ...points, points[points.length - 1]];
  let d = `M${points[0].x},${points[0].y}`;

  for (let i = 1; i < pts.length - 2; i++) {
    const p0 = pts[i - 1], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2];
    const cp1x = p1.x + ((p2.x - p0.x) * tension) / 6;
    const cp1y = p1.y + ((p2.y - p0.y) * tension) / 6;
    const cp2x = p2.x - ((p3.x - p1.x) * tension) / 6;
    const cp2y = p2.y - ((p3.y - p1.y) * tension) / 6;
    d += `C${cp1x},${cp1y},${cp2x},${cp2y},${p2.x},${p2.y}`;
  }

  return d;
}

// ─── Shared Card ────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-[#1d1e20] p-4 ${className}`} style={{ border: "0.5px solid rgba(255,255,255,0.1)" }}>
      {children}
    </div>
  );
}

// ─── Stat Card ──────────────────────────────────────────

function StatCard({
  label,
  value,
  change,
  changeColor = "green",
  delay = 0,
}: {
  label: string;
  value: string;
  change: string;
  changeColor?: "green" | "red";
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: EASE_OUT_QUART }}
      className="flex-1 min-w-0"
    >
      <Card className="h-[125px] flex flex-col justify-between">
        <span className="font-mono text-[11px] uppercase tracking-wider text-[rgba(255,255,255,0.5)]">{label}</span>
        <span className="text-[34px] leading-10 text-white tabular-nums" style={{ fontFamily: "'Possibility', sans-serif" }}>{value}</span>
        <span className={`font-mono text-[11px] tabular-nums ${changeColor === "green" ? "text-[#46d08f]" : "text-[#ef5350]"}`}>
          {change}
        </span>
      </Card>
    </motion.div>
  );
}

// ─── Performance Card ───────────────────────────────────

function PerfCard({
  label,
  value,
  valueColor,
  subtitle,
  delay = 0,
}: {
  label: string;
  value: string;
  valueColor: string;
  subtitle: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: EASE_OUT_QUART }}
      className="flex-1 min-w-0"
    >
      <Card className="h-[125px] flex flex-col justify-between">
        <span className="font-mono text-[11px] uppercase tracking-wider text-[rgba(255,255,255,0.5)]">{label}</span>
        <span className="text-[34px] leading-10 tabular-nums" style={{ color: valueColor, fontFamily: "'Possibility', sans-serif" }}>{value}</span>
        <span className="font-mono text-[11px] text-[rgba(255,255,255,0.5)]">{subtitle}</span>
      </Card>
    </motion.div>
  );
}

// ─── Trend Line Chart ───────────────────────────────────

interface TrendLineConfig {
  dataKey: string;
  color: string;
  strokeWidth?: number;
}

function TrendLineChart({
  data,
  lines,
  height = 200,
  xKey = "date",
}: {
  data: Record<string, number | string>[];
  lines: TrendLineConfig[];
  height?: number;
  xKey?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const gradientIds = lines.map((l) => `gradient-${l.dataKey}-${useId()}`);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const PADDING = { top: 12, right: 8, bottom: 4, left: 8 };
  const CHART_HEIGHT = height;
  const VIEW_WIDTH = 600;
  const PLOT_HEIGHT = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const PLOT_WIDTH = VIEW_WIDTH - PADDING.left - PADDING.right;

  const computed = useMemo(() => {
    if (data.length < 2) return null;

    // Find global min/max across all lines
    let globalMin = Infinity, globalMax = -Infinity;
    for (const line of lines) {
      for (const d of data) {
        const v = d[line.dataKey] as number;
        if (v < globalMin) globalMin = v;
        if (v > globalMax) globalMax = v;
      }
    }
    const range = globalMax - globalMin || 1;
    const minVal = globalMin - range * 0.05;
    const maxVal = globalMax + range * 0.1;
    const adjustedRange = maxVal - minVal;

    const lineData = lines.map((line) => {
      const points = data.map((d, i) => ({
        x: PADDING.left + (i / (data.length - 1)) * PLOT_WIDTH,
        y: PADDING.top + PLOT_HEIGHT * (1 - ((d[line.dataKey] as number) - minVal) / adjustedRange),
      }));
      const linePath = catmullRomToBezier(points);
      const baseline = PADDING.top + PLOT_HEIGHT;
      const areaPath = `${linePath}L${points[points.length - 1].x},${baseline}L${points[0].x},${baseline}Z`;
      return { points, linePath, areaPath };
    });

    // X-axis labels (show first, middle, last)
    const tickIndices = [0, Math.floor(data.length / 2), data.length - 1];

    return { lineData, tickIndices, minVal, adjustedRange };
  }, [data, lines, PLOT_HEIGHT, PLOT_WIDTH, PADDING.left, PADDING.top]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const xFraction = (e.clientX - rect.left) / rect.width;
      const nearest = Math.round(xFraction * (data.length - 1));
      setHoverIndex(Math.max(0, Math.min(nearest, data.length - 1)));
    },
    [data.length]
  );

  if (!computed) return null;
  const { lineData, tickIndices } = computed;

  const hoverXPercent = hoverIndex !== null ? (hoverIndex / (data.length - 1)) * 100 : 0;

  return (
    <div ref={ref} className="flex flex-col w-full">
      <div className="relative" style={{ height }}>
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${CHART_HEIGHT}`}
          className="h-full w-full"
          preserveAspectRatio="none"
        >
          <defs>
            {lines.map((line, i) => (
              <linearGradient key={i} id={gradientIds[i]} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={line.color} stopOpacity="0.25" />
                <stop offset="100%" stopColor={line.color} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>

          {/* Horizontal grid lines */}
          {[0.25, 0.5, 0.75].map((frac) => (
            <line
              key={frac}
              x1={PADDING.left}
              y1={PADDING.top + PLOT_HEIGHT * frac}
              x2={PADDING.left + PLOT_WIDTH}
              y2={PADDING.top + PLOT_HEIGHT * frac}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="0.5"
            />
          ))}

          {/* Area fills */}
          {lineData.map((ld, i) => (
            <motion.path
              key={`area-${i}`}
              d={ld.areaPath}
              fill={`url(#${gradientIds[i]})`}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
            />
          ))}

          {/* Lines */}
          {lineData.map((ld, i) => (
            <motion.path
              key={`line-${i}`}
              d={ld.linePath}
              fill="none"
              stroke={lines[i].color}
              strokeWidth={lines[i].strokeWidth ?? 1.5}
              initial={{ pathLength: 0 }}
              animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 1.5, delay: i * 0.1, ease: EASE_IN_OUT }}
            />
          ))}
        </svg>

        {/* Dot overlay SVG — separate so dots aren't distorted by preserveAspectRatio="none" */}
        {hoverIndex !== null && (
          <svg
            viewBox={`0 0 ${VIEW_WIDTH} ${CHART_HEIGHT}`}
            className="absolute inset-0 h-full w-full pointer-events-none"
            preserveAspectRatio="none"
          >
            {lineData.map((ld, li) => {
              const pt = ld.points[hoverIndex];
              // Scale radii to counteract the non-uniform scaling
              const scaleX = VIEW_WIDTH;
              const scaleY = CHART_HEIGHT;
              return (
                <ellipse
                  key={`dot-${li}`}
                  cx={pt.x}
                  cy={pt.y}
                  rx={3 * (scaleX / 600)}
                  ry={3 * (scaleY / 200)}
                  fill={lines[li].color}
                  stroke="#1d1e20"
                  strokeWidth={Math.max(scaleX / 600, scaleY / 200) * 1.5}
                />
              );
            })}
          </svg>
        )}

        {/* Hover overlay */}
        <div
          ref={overlayRef}
          className="absolute inset-0 z-10 touch-pan-y"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoverIndex(null)}
        >
          <AnimatePresence>
            {hoverIndex !== null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="absolute top-0 bottom-0 w-px"
                style={{
                  left: `${hoverXPercent}%`,
                  transform: "translateX(-0.5px)",
                  transition: "left 60ms ease-out",
                  background: "rgba(255,255,255,0.2)",
                }}
              />
            )}
          </AnimatePresence>

          {/* Hover tooltip */}
          <AnimatePresence>
            {hoverIndex !== null && overlayRef.current && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15 }}
                className="absolute z-20 rounded-lg bg-[#2a2b2d] px-3 py-2 shadow-lg pointer-events-none"
                style={{
                  left: `${hoverXPercent}%`,
                  top: 8,
                  transform: "translateX(-50%)",
                  transition: "left 60ms ease-out",
                  border: "0.5px solid rgba(255,255,255,0.15)",
                }}
              >
                <div className="font-mono text-[10px] text-[rgba(255,255,255,0.5)] mb-1">
                  {data[hoverIndex][xKey] as string}
                </div>
                <div className="flex flex-col gap-0.5">
                  {lines.map((line) => (
                    <div key={line.dataKey} className="flex items-center gap-1.5">
                      <div className="size-1.5 rounded-full" style={{ backgroundColor: line.color }} />
                      <span className="font-mono text-[11px] tabular-nums text-white">
                        {data[hoverIndex][line.dataKey] as number}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* X-axis labels */}
      <div className="flex w-full justify-between px-2 pt-2">
        {tickIndices.map((idx) => (
          <span
            key={idx}
            className="font-mono text-[10px] uppercase tracking-wider text-[rgba(255,255,255,0.35)]"
          >
            {data[idx][xKey] as string}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Bar Chart ──────────────────────────────────────────

function BarChart({
  data,
  bars,
  height = 150,
  xKey = "date",
}: {
  data: Record<string, number | string>[];
  bars: { dataKey: string; color: string }[];
  height?: number;
  xKey?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const anyHovered = hoverIndex !== null;

  const maxValue = useMemo(() => {
    let max = 0;
    for (const bar of bars) {
      for (const d of data) {
        const v = d[bar.dataKey] as number;
        if (v > max) max = v;
      }
    }
    return max || 1;
  }, [data, bars]);

  return (
    <div ref={ref} className="flex flex-col w-full" style={{ height }}>
      <div className="flex flex-1 items-end gap-0">
        {data.map((d, i) => {
          const isHovered = hoverIndex === i;
          return (
            <div
              key={i}
              className="flex flex-1 cursor-default flex-col items-center justify-end gap-1"
              style={{
                opacity: anyHovered && !isHovered ? 0.35 : 1,
                transition: "opacity 200ms ease",
              }}
              onPointerEnter={() => setHoverIndex(i)}
              onPointerLeave={() => setHoverIndex(null)}
            >
              {/* Hover label */}
              {isHovered && (
                <div className="flex flex-col items-center gap-0.5 mb-1">
                  {bars.map((bar) => (
                    <span key={bar.dataKey} className="font-mono text-[10px] tabular-nums" style={{ color: bar.color }}>
                      {d[bar.dataKey] as number}
                    </span>
                  ))}
                </div>
              )}
              {/* Bars */}
              <div className="flex items-end gap-[2px]">
                {bars.map((bar, bi) => {
                  const value = d[bar.dataKey] as number;
                  const barHeight = Math.max((value / maxValue) * (height * 0.7), value > 0 ? 4 : 0);
                  return (
                    <motion.div
                      key={bar.dataKey}
                      className="rounded-full"
                      initial={{ height: 4 }}
                      animate={inView ? { height: barHeight } : { height: 4 }}
                      transition={{
                        delay: i * 0.03 + bi * 0.05,
                        duration: 0.6,
                        ease: EASE_IN_OUT,
                      }}
                      style={{
                        backgroundColor: bar.color,
                        width: isHovered ? 4 : 2,
                        boxShadow: isHovered ? `0 0 8px ${bar.color}66` : "none",
                        transition: "width 200ms ease, box-shadow 200ms ease",
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* X-axis labels */}
      <div className="flex shrink-0 gap-0 pt-2">
        {data.map((d, i) => {
          const isHovered = hoverIndex === i;
          // Only show every few labels to avoid crowding
          const showLabel = i === 0 || i === data.length - 1 || i % Math.ceil(data.length / 5) === 0;
          return (
            <span
              key={i}
              className="flex-1 text-center font-mono text-[10px] uppercase tracking-wider"
              style={{
                color: isHovered ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.25)",
                opacity: !showLabel && !isHovered ? 0 : anyHovered && !isHovered ? 0.35 : 1,
                transition: "color 200ms ease, opacity 200ms ease",
              }}
            >
              {(d[xKey] as string).replace(/^[A-Z][a-z]+\s/, "")}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ─── Legend Chip ─────────────────────────────────────────

function LegendChip({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg px-2.5 h-[27px]" style={{ background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.15)" }}>
      <div className="size-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <span className="font-mono text-[11px] text-white whitespace-nowrap">{label}</span>
    </div>
  );
}

// ─── Legend Dot ──────────────────────────────────────────

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="size-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <span className="font-mono text-[11px] text-[rgba(255,255,255,0.5)]">{label}</span>
    </div>
  );
}

// ─── Show Rate Bar ──────────────────────────────────────

function ShowRateBar({ percent, color }: { percent: number; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });

  return (
    <div ref={ref} className="flex items-center gap-2">
      <div className="w-9 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${percent}%` } : { width: 0 }}
          transition={{ duration: 0.8, ease: EASE_OUT_QUART }}
        />
      </div>
      <span className="font-mono text-[11px] tabular-nums" style={{ color }}>{percent}%</span>
    </div>
  );
}

// ─── Section Labels ─────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[11px] uppercase tracking-wider text-[rgba(255,255,255,0.5)]">{children}</p>;
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-[10px] uppercase tracking-wider text-[rgba(255,255,255,0.4)]">{children}</span>;
}

// ─── Chart Data ─────────────────────────────────────────

const eventTrendsChartData = [
  { date: "Jan 5", booked: 14, completed: 12, rescheduled: 1, cancelled: 2 },
  { date: "Jan 12", booked: 16, completed: 14, rescheduled: 2, cancelled: 1 },
  { date: "Jan 19", booked: 12, completed: 10, rescheduled: 1, cancelled: 2 },
  { date: "Jan 26", booked: 18, completed: 16, rescheduled: 3, cancelled: 1 },
  { date: "Feb 2", booked: 15, completed: 13, rescheduled: 2, cancelled: 1 },
  { date: "Feb 9", booked: 20, completed: 18, rescheduled: 1, cancelled: 2 },
  { date: "Feb 16", booked: 22, completed: 20, rescheduled: 2, cancelled: 1 },
  { date: "Feb 23", booked: 26, completed: 24, rescheduled: 3, cancelled: 2 },
  { date: "Mar 2", booked: 30, completed: 28, rescheduled: 2, cancelled: 1 },
];

const dropInChartData = [
  { date: "Jan 5", attempted: 5, accepted: 4 },
  { date: "Jan 12", attempted: 7, accepted: 6 },
  { date: "Jan 19", attempted: 6, accepted: 5 },
  { date: "Jan 26", attempted: 8, accepted: 7 },
  { date: "Feb 2", attempted: 7, accepted: 6 },
  { date: "Feb 9", attempted: 9, accepted: 8 },
  { date: "Feb 16", attempted: 10, accepted: 9 },
  { date: "Feb 23", attempted: 12, accepted: 11 },
  { date: "Mar 2", attempted: 14, accepted: 12 },
];

const lobbyLinks = [
  { name: "May I Meet You?", slug: "ro.am/howard", booked: 89, showRate: 91, showColor: GREEN, dropIns: 24 },
  { name: "Hour with Howard", slug: "ro.am/howard/hour", booked: 42, showRate: 88, showColor: YELLOW, dropIns: 8 },
  { name: "Howard's Lobby", slug: "ro.am/howard/next", booked: 67, showRate: 94, showColor: GREEN, dropIns: 31 },
  { name: "Onboard Your Company", slug: "ro.am/howard/roamgineer", booked: 38, showRate: 97, showColor: GREEN, dropIns: 5 },
];

const people = [
  { initials: "HL", name: "Howard Lerman", booked: 89, completed: 78, cancelled: 6, showRate: 88, showColor: YELLOW, dropIns: 34 },
  { initials: "AW", name: "Aaron Wadhwa", booked: 52, completed: 46, cancelled: 4, showRate: 88, showColor: YELLOW, dropIns: 15 },
  { initials: "PN", name: "Peter Nguyen", booked: 44, completed: 37, cancelled: 2, showRate: 84, showColor: YELLOW, dropIns: 15 },
];

// ─── Lobby Link Table ───────────────────────────────────

function LobbyLinkTable() {
  const [hoverRow, setHoverRow] = useState<number | null>(null);
  const anyHovered = hoverRow !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE_OUT_QUART }}
      className="rounded-xl overflow-hidden bg-[#1d1e20]"
      style={{ border: "0.5px solid rgba(255,255,255,0.1)" }}
    >
      <div className="grid grid-cols-[1fr_80px_110px_80px] px-5 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <TableHeader>Lobby</TableHeader>
        <TableHeader>Booked</TableHeader>
        <TableHeader>Show Rate</TableHeader>
        <TableHeader>Drop-Ins</TableHeader>
      </div>
      {lobbyLinks.map((link, i) => (
        <motion.div
          key={link.slug}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 + i * 0.06, ease: EASE_OUT_QUART }}
          className="grid grid-cols-[1fr_80px_110px_80px] items-center px-5 h-[67px] cursor-default transition-all duration-200"
          style={{
            borderBottom: i < lobbyLinks.length - 1 ? "1px solid rgba(255,255,255,0.04)" : undefined,
            background: hoverRow === i ? "rgba(255,255,255,0.04)" : "transparent",
            opacity: anyHovered && hoverRow !== i ? 0.5 : 1,
          }}
          onPointerEnter={() => setHoverRow(i)}
          onPointerLeave={() => setHoverRow(null)}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] leading-[19.5px] text-white">{link.name}</span>
            <span className="font-mono text-[11px] text-[rgba(255,255,255,0.4)]">{link.slug}</span>
          </div>
          <motion.span
            className="text-lg font-light leading-[27px] text-white tabular-nums"
            animate={{ scale: hoverRow === i ? 1.05 : 1 }}
            transition={{ duration: 0.15 }}
          >
            {link.booked}
          </motion.span>
          <ShowRateBar percent={link.showRate} color={link.showColor} />
          <motion.span
            className="text-lg font-light leading-[27px] tabular-nums"
            style={{ color: BLUE }}
            animate={{ scale: hoverRow === i ? 1.05 : 1 }}
            transition={{ duration: 0.15 }}
          >
            {link.dropIns}
          </motion.span>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ─── Person Table ───────────────────────────────────────

function PersonTable() {
  const [hoverRow, setHoverRow] = useState<number | null>(null);
  const anyHovered = hoverRow !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1, ease: EASE_OUT_QUART }}
      className="rounded-xl overflow-hidden mb-6 bg-[#1d1e20]"
      style={{ border: "0.5px solid rgba(255,255,255,0.1)" }}
    >
      <div className="grid grid-cols-[1fr_70px_90px_80px_100px_70px] px-5 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <TableHeader>Person</TableHeader>
        <TableHeader>Booked</TableHeader>
        <TableHeader>Completed</TableHeader>
        <TableHeader>Cancelled</TableHeader>
        <TableHeader>Show Rate</TableHeader>
        <TableHeader>Drop-Ins</TableHeader>
      </div>
      {people.map((person, i) => (
        <motion.div
          key={person.name}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 + i * 0.06, ease: EASE_OUT_QUART }}
          className="grid grid-cols-[1fr_70px_90px_80px_100px_70px] items-center px-5 h-[59px] cursor-default transition-all duration-200"
          style={{
            borderBottom: i < people.length - 1 ? "1px solid rgba(255,255,255,0.04)" : undefined,
            background: hoverRow === i ? "rgba(255,255,255,0.04)" : "transparent",
            opacity: anyHovered && hoverRow !== i ? 0.5 : 1,
          }}
          onPointerEnter={() => setHoverRow(i)}
          onPointerLeave={() => setHoverRow(null)}
        >
          <div className="flex items-center gap-2.5">
            <motion.div
              className="size-[30px] rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: "rgba(110,49,231,0.15)", border: `1px solid ${ACCENT}` }}
              animate={{
                boxShadow: hoverRow === i ? `0 0 12px rgba(110,49,231,0.4)` : "0 0 0px rgba(110,49,231,0)",
              }}
              transition={{ duration: 0.2 }}
            >
              <span className="font-mono text-[10px] tracking-wider" style={{ color: ACCENT }}>{person.initials}</span>
            </motion.div>
            <span className="text-[13px] leading-[19.5px] text-white">{person.name}</span>
          </div>
          <span className="text-base font-light leading-6 text-white tabular-nums">{person.booked}</span>
          <span className="text-base font-light leading-6 text-white tabular-nums">{person.completed}</span>
          <span className="text-base font-light leading-6 text-white tabular-nums">{person.cancelled}</span>
          <ShowRateBar percent={person.showRate} color={person.showColor} />
          <motion.span
            className="text-base font-light leading-6 tabular-nums"
            style={{ color: BLUE }}
            animate={{ scale: hoverRow === i ? 1.05 : 1 }}
            transition={{ duration: 0.15 }}
          >
            {person.dropIns}
          </motion.span>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────

export default function InsightsView() {
  return (
    <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between pl-6 pr-3 h-[62px] shrink-0 border-b-[0.5px] border-[var(--border-primary)]">
        <h1 className="text-sm font-medium leading-5 text-white tracking-[-0.15px]">
          Insights
        </h1>
        <button className="flex items-center gap-2 pl-1.5 pr-0.5 py-0.5 rounded-md hover:bg-[rgba(255,255,255,0.05)] transition-colors">
          <span className="text-sm leading-5 text-white tracking-[-0.15px]">Last 30 Days</span>
          <div className="flex items-center p-0.5 rounded-md" style={{ background: "rgba(255,255,255,0.05)" }}>
            <ChevronIcon className="size-4 text-[rgba(255,255,255,0.5)]" />
          </div>
        </button>
      </header>

      <div className="flex flex-col gap-5 p-6 overflow-y-auto flex-1">

        {/* Events */}
        <SectionLabel>Events</SectionLabel>
        <div className="flex gap-3">
          <StatCard label="Meetings Booked" value="185" change="▲ 22% from last period" changeColor="green" delay={0} />
          <StatCard label="Meetings Completed" value="161" change="▲ 18% from last period" changeColor="green" delay={0.05} />
          <StatCard label="Rescheduled" value="12" change="▲ 8% from last period" changeColor="green" delay={0.1} />
          <StatCard label="Cancelled" value="12" change="▼ 15% from last period" changeColor="red" delay={0.15} />
        </div>

        {/* Performance */}
        <SectionLabel>Performance</SectionLabel>
        <div className="flex gap-3">
          <PerfCard label="No-Show (Host)" value="2" valueColor={RED} subtitle="1.2% of completed" delay={0} />
          <PerfCard label="No-Show (Guest)" value="10" valueColor={YELLOW} subtitle="6.2% of completed" delay={0.05} />
          <PerfCard label="Drop-Ins" value="64" valueColor={GREEN} subtitle="74 attempted · 86% accepted" delay={0.1} />
        </div>

        {/* Event Trends Chart */}
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[rgba(255,255,255,0.5)]">Event Trends</span>
            <div className="flex gap-2">
              <LegendChip color={ACCENT} label="Booked" />
              <LegendChip color={GREEN} label="Completed" />
              <LegendChip color={BLUE} label="Rescheduled" />
              <LegendChip color={RED} label="Cancelled" />
            </div>
          </div>
          <TrendLineChart
            data={eventTrendsChartData}
            lines={[
              { dataKey: "booked", color: ACCENT, strokeWidth: 1.5 },
              { dataKey: "completed", color: GREEN, strokeWidth: 1.5 },
              { dataKey: "rescheduled", color: BLUE, strokeWidth: 1 },
              { dataKey: "cancelled", color: RED, strokeWidth: 1 },
            ]}
            height={200}
          />
        </Card>

        {/* Drop-In Activity Chart */}
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[rgba(255,255,255,0.5)]">Drop-In Activity</span>
            <div className="flex gap-2">
              <LegendChip color={BLUE} label="Attempted" />
              <LegendChip color={GREEN} label="Accepted" />
            </div>
          </div>
          <TrendLineChart
            data={dropInChartData}
            lines={[
              { dataKey: "attempted", color: BLUE, strokeWidth: 1.5 },
              { dataKey: "accepted", color: GREEN, strokeWidth: 1.5 },
            ]}
            height={180}
          />
        </Card>

        {/* By Lobby Link */}
        <SectionLabel>By Lobby Link</SectionLabel>
        <LobbyLinkTable />

        {/* By Person */}
        <SectionLabel>By Person</SectionLabel>
        <PersonTable />
      </div>
    </div>
  );
}
