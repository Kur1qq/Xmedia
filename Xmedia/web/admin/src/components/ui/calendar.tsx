"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <div className={cn("p-3 bg-[#1a1a1a] text-white rounded-xl shadow-xl", className)}>
      <style>{`
        .rdp-root {
          --rdp-accent-color: #3b82f6; 
          --rdp-background-color: #262626;
          --rdp-day_button-width: 2.25rem;
          --rdp-day_button-height: 2.25rem;
          margin: 0;
        }
        .rdp-day_button:hover:not([disabled]) {
          background-color: #3b82f6;
          color: white;
        }
      `}</style>
      <DayPicker
        showOutsideDays={showOutsideDays}
        {...props}
      />
    </div>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
