"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// ─── Icons ───────────────────────────────────────────────

function ChevronIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Shared Card ─────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-[#1d1e20] p-4 ${className}`} style={{ border: "0.5px solid rgba(255,255,255,0.1)" }}>
      {children}
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────

function StatCard({
  label,
  value,
  change,
  changeColor = "green",
}: {
  label: string;
  value: string;
  change: string;
  changeColor?: "green" | "red";
}) {
  return (
    <Card className="flex-1 min-w-0 h-[125px] flex flex-col justify-between">
      <span className="text-xs leading-4 text-[rgba(255,255,255,0.5)]">{label}</span>
      <span className="text-[34px] font-semibold leading-10 text-white">{value}</span>
      <span className={`text-xs leading-4 ${changeColor === "green" ? "text-[#46d08f]" : "text-[#ef5350]"}`}>
        {change}
      </span>
    </Card>
  );
}

// ─── Performance Card ────────────────────────────────────

function PerfCard({
  label,
  value,
  valueColor,
  subtitle,
}: {
  label: string;
  value: string;
  valueColor: string;
  subtitle: string;
}) {
  return (
    <Card className="flex-1 min-w-0 h-[125px] flex flex-col justify-between">
      <span className="text-xs leading-4 text-[rgba(255,255,255,0.5)]">{label}</span>
      <span className="text-[34px] font-semibold leading-10" style={{ color: valueColor }}>{value}</span>
      <span className="text-xs leading-4 text-[rgba(255,255,255,0.5)]">{subtitle}</span>
    </Card>
  );
}

// ─── Legend Chip ──────────────────────────────────────────

function LegendChip({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg px-2.5 h-[27px]" style={{ background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.15)" }}>
      <div className="size-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <span className="text-[11px] leading-[16.5px] text-white whitespace-nowrap">{label}</span>
    </div>
  );
}

// ─── Legend Dot ───────────────────────────────────────────

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="size-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <span className="text-[11px] leading-[16.5px] text-[rgba(255,255,255,0.5)]">{label}</span>
    </div>
  );
}

// ─── Show Rate Bar ───────────────────────────────────────

function ShowRateBar({ percent, color }: { percent: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-9 h-1 rounded-sm overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
        <div className="h-full rounded-sm" style={{ width: `${percent}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs leading-[18px] tabular-nums" style={{ color }}>{percent}%</span>
    </div>
  );
}

// ─── Section Labels ──────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-5 text-[rgba(255,255,255,0.5)] tracking-[-0.15px]">{children}</p>;
}

function TableSectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] leading-[16.5px] text-[rgba(255,255,255,0.5)] tracking-[1.1px] uppercase">{children}</p>;
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return <span className="text-[11px] leading-[16.5px] text-[rgba(255,255,255,0.5)] tracking-[0.55px] uppercase">{children}</span>;
}

// ─── Chart Data ──────────────────────────────────────────

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
  { name: "May I Meet You?", slug: "ro.am/howard", booked: 89, showRate: 91, showColor: "#46d08f", dropIns: 24 },
  { name: "Hour with Howard", slug: "ro.am/howard/hour", booked: 42, showRate: 88, showColor: "#ffc107", dropIns: 8 },
  { name: "Howard's Lobby", slug: "ro.am/howard/next", booked: 67, showRate: 94, showColor: "#46d08f", dropIns: 31 },
  { name: "Onboard Your Company", slug: "ro.am/howard/roamgineer", booked: 38, showRate: 97, showColor: "#46d08f", dropIns: 5 },
];

const people = [
  { initials: "HL", name: "Howard Lerman", booked: 89, completed: 78, cancelled: 6, showRate: 88, showColor: "#ffc107", dropIns: 34 },
  { initials: "AW", name: "Aaron Wadhwa", booked: 52, completed: 46, cancelled: 4, showRate: 88, showColor: "#ffc107", dropIns: 15 },
  { initials: "PN", name: "Peter Nguyen", booked: 44, completed: 37, cancelled: 2, showRate: 84, showColor: "#ffc107", dropIns: 15 },
];

// ─── Shared chart axis styles ────────────────────────────

const axisTickStyle = { fontSize: 11, fill: "rgba(255,255,255,0.5)", fontFamily: "Inter" };

// ─── Main Component ──────────────────────────────────────

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
        <StatCard label="Meetings Booked" value="185" change="▲ 22% from last period" changeColor="green" />
        <StatCard label="Meetings Completed" value="161" change="▲ 18% from last period" changeColor="green" />
        <StatCard label="Rescheduled" value="12" change="▲ 8% from last period" changeColor="green" />
        <StatCard label="Cancelled" value="12" change="▼ 15% from last period" changeColor="red" />
      </div>

      {/* Performance */}
      <SectionLabel>Performance</SectionLabel>
      <div className="flex gap-3">
        <PerfCard label="No-Show (Host)" value="2" valueColor="#ef5350" subtitle="1.2% of completed" />
        <PerfCard label="No-Show (Guest)" value="10" valueColor="#ffc107" subtitle="6.2% of completed" />
        <PerfCard label="Drop-Ins" value="64" valueColor="#46d08f" subtitle="74 attempted · 86% accepted" />
      </div>

      {/* Event Trends Chart */}
      <Card className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <span className="text-xs leading-4 text-[rgba(255,255,255,0.5)]">Event Trends</span>
          <div className="flex gap-2">
            <LegendChip color="#6e31e7" label="Booked" />
            <LegendChip color="#46d08f" label="Completed" />
            <LegendChip color="#2c80ff" label="Rescheduled" />
            <LegendChip color="#ef5350" label="Cancelled" />
          </div>
        </div>
        <div className="w-full h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={eventTrendsChartData} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="" vertical={false} />
              <XAxis dataKey="date" tick={axisTickStyle} axisLine={false} tickLine={false} dy={8} />
              <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} domain={[0, 32]} ticks={[0, 8, 16, 24, 32]} dx={-4} />
              <Line type="monotone" dataKey="booked" stroke="#6e31e7" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="completed" stroke="#46d08f" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="rescheduled" stroke="#2c80ff" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="cancelled" stroke="#ef5350" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Drop-In Activity Chart */}
      <Card className="flex flex-col gap-5">
        <span className="text-xs leading-4 text-[rgba(255,255,255,0.5)]">Drop-In Activity</span>
        <div className="w-full h-[150px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dropInChartData} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="" vertical={false} />
              <XAxis dataKey="date" tick={axisTickStyle} axisLine={false} tickLine={false} dy={8} />
              <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} domain={[0, 16]} ticks={[0, 4, 8, 12, 16]} dx={-4} />
              <Line type="monotone" dataKey="attempted" stroke="#2c80ff" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="accepted" stroke="#46d08f" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4">
          <LegendDot color="#2c80ff" label="Attempted" />
          <LegendDot color="#46d08f" label="Accepted" />
        </div>
      </Card>

      {/* By Lobby Link */}
      <TableSectionLabel>By Lobby Link</TableSectionLabel>
      <div className="rounded-xl overflow-hidden bg-[#1d1e20]" style={{ border: "0.5px solid rgba(255,255,255,0.1)" }}>
        <div className="grid grid-cols-[1fr_80px_110px_80px] px-5 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <TableHeader>Lobby</TableHeader>
          <TableHeader>Booked</TableHeader>
          <TableHeader>Show Rate</TableHeader>
          <TableHeader>Drop-Ins</TableHeader>
        </div>
        {lobbyLinks.map((link, i) => (
          <div key={link.slug} className="grid grid-cols-[1fr_80px_110px_80px] items-center px-5 h-[67px]" style={i < lobbyLinks.length - 1 ? { borderBottom: "1px solid rgba(255,255,255,0.04)" } : undefined}>
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] leading-[19.5px] text-white">{link.name}</span>
              <span className="text-[11px] leading-[16.5px] text-[rgba(255,255,255,0.5)]">{link.slug}</span>
            </div>
            <span className="text-lg font-light leading-[27px] text-white tabular-nums">{link.booked}</span>
            <ShowRateBar percent={link.showRate} color={link.showColor} />
            <span className="text-lg font-light leading-[27px] text-[#2c80ff] tabular-nums">{link.dropIns}</span>
          </div>
        ))}
      </div>

      {/* By Person */}
      <TableSectionLabel>By Person</TableSectionLabel>
      <div className="rounded-xl overflow-hidden mb-6 bg-[#1d1e20]" style={{ border: "0.5px solid rgba(255,255,255,0.1)" }}>
        <div className="grid grid-cols-[1fr_70px_90px_80px_100px_70px] px-5 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <TableHeader>Person</TableHeader>
          <TableHeader>Booked</TableHeader>
          <TableHeader>Completed</TableHeader>
          <TableHeader>Cancelled</TableHeader>
          <TableHeader>Show Rate</TableHeader>
          <TableHeader>Drop-Ins</TableHeader>
        </div>
        {people.map((person, i) => (
          <div key={person.name} className="grid grid-cols-[1fr_70px_90px_80px_100px_70px] items-center px-5 h-[59px]" style={i < people.length - 1 ? { borderBottom: "1px solid rgba(255,255,255,0.04)" } : undefined}>
            <div className="flex items-center gap-2.5">
              <div className="size-[30px] rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(110,49,231,0.15)", border: "1px solid #6e31e7" }}>
                <span className="text-[10.8px] leading-[16.2px] text-[#6e31e7] tracking-[0.216px]">{person.initials}</span>
              </div>
              <span className="text-[13px] leading-[19.5px] text-white">{person.name}</span>
            </div>
            <span className="text-base font-light leading-6 text-white tabular-nums">{person.booked}</span>
            <span className="text-base font-light leading-6 text-white tabular-nums">{person.completed}</span>
            <span className="text-base font-light leading-6 text-white tabular-nums">{person.cancelled}</span>
            <ShowRateBar percent={person.showRate} color={person.showColor} />
            <span className="text-base font-light leading-6 text-[#2c80ff] tabular-nums">{person.dropIns}</span>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
