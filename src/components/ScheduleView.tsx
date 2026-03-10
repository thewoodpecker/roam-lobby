"use client";

import { useState } from "react";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

// ─── Icons ───────────────────────────────────────────────

function ChevronLeftIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EllipsisHIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="3.5" cy="8" r="1.25" fill="currentColor" />
      <circle cx="8" cy="8" r="1.25" fill="currentColor" />
      <circle cx="12.5" cy="8" r="1.25" fill="currentColor" />
    </svg>
  );
}

const LOBBY_THUMBS = [`${BASE_PATH}/lobby-thumb.png`, `${BASE_PATH}/lobby-green.png`, `${BASE_PATH}/lobby-purple.png`];

// ─── Data ────────────────────────────────────────────────

interface ScheduleEvent {
  id: number;
  time: string;
  name: string;
  meetingName: string;
  slug: string;
}

interface ScheduleDay {
  dayLabel: string;
  dateNum: string;
  isToday?: boolean;
  events: ScheduleEvent[];
}

const scheduleData: ScheduleDay[] = [
  {
    dayLabel: "Mon",
    dateNum: "11",
    isToday: true,
    events: [
      { id: 1, time: "9:00 - 11:30 AM", name: "Jon Snow", meetingName: "Jesse's Lobby", slug: "ro.am/jesse/fire" },
      { id: 2, time: "12:30 - 1:30 PM", name: "Annette Black", meetingName: "Fashion Police", slug: "ro.am/jesse/urban" },
      { id: 3, time: "3:30 - 4:30 PM", name: "Eleanor Pena", meetingName: "Mountaineers", slug: "ro.am/jesse/mountain" },
      { id: 4, time: "6:30 - 8:30 PM", name: "Jacob Jones", meetingName: "Meet Jesse", slug: "ro.am/jesse/fire" },
    ],
  },
  {
    dayLabel: "Tue",
    dateNum: "12",
    events: [
      { id: 5, time: "9:00 - 11:30 AM", name: "Brooklyn Simmons", meetingName: "Creative Meet", slug: "ro.am/jesse/creative" },
      { id: 6, time: "12:30 - 1:30 PM", name: "Kristin Watson", meetingName: "Celebration Hour", slug: "ro.am/jesse/fiesta" },
      { id: 7, time: "3:30 - 4:30 PM", name: "Floyd Miles", meetingName: "Design Review", slug: "ro.am/jesse/design" },
    ],
  },
  {
    dayLabel: "Wed",
    dateNum: "13",
    events: [
      { id: 8, time: "10:00 - 11:00 AM", name: "Cameron Williamson", meetingName: "Sprint Planning", slug: "ro.am/jesse/sprint" },
      { id: 9, time: "2:00 - 3:00 PM", name: "Savannah Nguyen", meetingName: "Product Sync", slug: "ro.am/jesse/product" },
    ],
  },
];

// ─── Event Row ───────────────────────────────────────────

function EventRow({ event }: { event: ScheduleEvent }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 w-full hover:bg-[var(--bg-primary)] transition-colors cursor-pointer">
      {/* Info */}
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium leading-5 text-white tracking-[-0.15px]">{event.name}</span>
          <span className="text-xs leading-4 text-[rgba(255,255,255,0.5)]">{event.meetingName}</span>
        </div>
        <span className="text-xs leading-4 text-[rgba(255,255,255,0.5)]">{event.slug}</span>
      </div>

      {/* Time */}
      <span className="text-xs leading-4 text-[rgba(255,255,255,0.5)] shrink-0">
        {event.time}
      </span>

      {/* More */}
      <button className="flex items-center justify-center size-8 rounded-lg text-[rgba(255,255,255,0.3)] hover:text-[rgba(255,255,255,0.5)] transition-colors shrink-0">
        <EllipsisHIcon className="size-4" />
      </button>

      {/* Thumbnail */}
      <div
        className="relative h-20 w-[120px] shrink-0 rounded-xl overflow-hidden"
        style={{ border: "0.5px solid rgba(255,255,255,0.1)" }}
      >
        <img src={LOBBY_THUMBS[event.id % LOBBY_THUMBS.length]} alt="" className="absolute inset-0 size-full object-cover" />
      </div>
    </div>
  );
}

// ─── Schedule View ───────────────────────────────────────

export default function ScheduleView() {
  const [month] = useState("September");
  const [year] = useState(2024);

  return (
    <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between pl-6 pr-3 h-[62px] shrink-0 border-b-[0.5px] border-[var(--border-primary)]">
        <h1 className="text-sm font-medium leading-5 text-white tracking-[-0.15px]">
          Schedule
        </h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm leading-5 text-white tracking-[-0.15px]">
              {month} <span className="text-[rgba(255,255,255,0.5)]">{year}</span>
            </span>
            <div className="flex items-center gap-1">
              <button className="flex items-center justify-center size-7 rounded-lg text-[rgba(255,255,255,0.5)] hover:text-white hover:bg-[var(--bg-primary)] transition-colors">
                <ChevronLeftIcon className="size-4" />
              </button>
              <button className="flex items-center justify-center size-7 rounded-lg text-[rgba(255,255,255,0.5)] hover:text-white hover:bg-[var(--bg-primary)] transition-colors">
                <ChevronRightIcon className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Schedule List */}
      <div className="flex-1 overflow-y-auto">
        {scheduleData.map((day) => (
          <div key={day.dateNum} className="flex border-b-[0.5px] border-[rgba(255,255,255,0.1)] last:border-b-0">
            {/* Day label */}
            <div className="flex flex-col items-center w-[72px] shrink-0 pt-3 border-r-[0.5px] border-[rgba(255,255,255,0.1)]">
              <span className="text-xs text-[rgba(255,255,255,0.5)]">{day.dayLabel}</span>
              <span
                className={`text-lg font-medium leading-7 ${
                  day.isToday
                    ? "text-white bg-[rgba(255,255,255,0.1)] rounded-full size-8 flex items-center justify-center"
                    : "text-[rgba(255,255,255,0.5)]"
                }`}
              >
                {day.dateNum}
              </span>
            </div>

            {/* Events */}
            <div className="flex flex-col flex-1 min-w-0">
              {day.events.map((event) => (
                <EventRow key={event.id} event={event} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
