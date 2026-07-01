import { useState } from "react";
import {
  CanvasCourse,
  CourseTime,
  CourseTimeSlot,
  WeekPattern,
} from "./api/canvas.types";
import "./CourseTimeSetter.css";

interface Props {
  course: CanvasCourse;
  initialTimes: CourseTime | null;
  onSave: (times: CourseTime) => void;
  onClose: () => void;
}

const DAYS: (keyof CourseTime)[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const DAY_LABELS: Record<keyof CourseTime, string> = {
  sunday: "Sun",
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
};

function emptyTimes(): CourseTime {
  return {
    sunday: null,
    monday: null,
    tuesday: null,
    wednesday: null,
    thursday: null,
    friday: null,
    saturday: null,
  };
}

function getISOWeek(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function getWeekLabel(date: Date): "A" | "B" {
  const d = new Date(date);
  if (d.getDay() === 0) d.setDate(d.getDate() + 1);
  return getISOWeek(d) % 2 === 1 ? "A" : "B";
}

const currentWeekLabel = getWeekLabel(new Date());

export default function CourseTimeSetter({
  course,
  initialTimes,
  onSave,
  onClose,
}: Props) {
  const [times, setTimes] = useState<CourseTime>(initialTimes ?? emptyTimes());

  const toggleDay = (day: keyof CourseTime) => {
    setTimes((prev) => ({
      ...prev,
      [day]: prev[day]
        ? null
        : ({
            times: ["09:00", "10:00"],
            weeks: "every",
          } satisfies CourseTimeSlot),
    }));
  };

  const updateTime = (day: keyof CourseTime, index: 0 | 1, value: string) => {
    setTimes((prev) => {
      const slot = prev[day];
      if (!slot) return prev;
      const updated: [string, string] = [slot.times[0], slot.times[1]];
      updated[index] = value;
      return { ...prev, [day]: { ...slot, times: updated } };
    });
  };

  const updateWeeks = (day: keyof CourseTime, weeks: WeekPattern) => {
    setTimes((prev) => {
      const slot = prev[day];
      if (!slot) return prev;
      return { ...prev, [day]: { ...slot, weeks } };
    });
  };

  return (
    <div className="cts-overlay" onClick={onClose}>
      <div className="cts-dialog" onClick={(e) => e.stopPropagation()}>
        <h5 className="cts-title">{course.name}</h5>
        <p className="cts-week-hint">
          Week A = odd-numbered weeks · Week B = even-numbered weeks · This week
          is <strong>Week {currentWeekLabel}</strong>
        </p>
        <table className="cts-table">
          <thead>
            <tr>
              <th className="cts-th">Day</th>
              <th className="cts-th">Repeats</th>
              <th className="cts-th">Start</th>
              <th className="cts-th">End</th>
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day) => {
              const slot = times[day];
              return (
                <tr key={day}>
                  <td className="cts-td">
                    <label className="cts-day-label">
                      <input
                        type="checkbox"
                        checked={slot !== null}
                        onChange={() => toggleDay(day)}
                      />
                      {DAY_LABELS[day]}
                    </label>
                  </td>
                  <td className="cts-td">
                    {slot && (
                      <select
                        className="cts-week-select"
                        value={slot.weeks}
                        onChange={(e) =>
                          updateWeeks(day, e.target.value as WeekPattern)
                        }
                      >
                        <option value="every">Every week</option>
                        <option value="A">Week A only</option>
                        <option value="B">Week B only</option>
                      </select>
                    )}
                  </td>
                  <td className="cts-td">
                    {slot && (
                      <input
                        className="cts-time-input"
                        type="time"
                        value={slot.times[0]}
                        onChange={(e) => updateTime(day, 0, e.target.value)}
                      />
                    )}
                  </td>
                  <td className="cts-td">
                    {slot && (
                      <input
                        className="cts-time-input"
                        type="time"
                        value={slot.times[1]}
                        onChange={(e) => updateTime(day, 1, e.target.value)}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="cts-actions">
          <button className="cts-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="cts-btn-save" onClick={() => onSave(times)}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
