import { useState } from "react";
import { CanvasCourse, CourseTime } from "./api/canvas.types";

interface Props {
  course: CanvasCourse;
  initialTimes: CourseTime | null;
  onSave: (times: CourseTime) => void;
  onClose: () => void;
}

const DAYS: (keyof CourseTime)[] = [
  "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday",
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

export default function CourseTimeSetter({ course, initialTimes, onSave, onClose }: Props) {
  const [times, setTimes] = useState<CourseTime>(initialTimes ?? emptyTimes());

  const toggleDay = (day: keyof CourseTime) => {
    setTimes((prev) => ({
      ...prev,
      [day]: prev[day] ? null : ["09:00", "10:00"],
    }));
  };

  const updateTime = (day: keyof CourseTime, index: 0 | 1, value: string) => {
    setTimes((prev) => {
      const current = prev[day];
      if (!current) return prev;
      const updated: [string, string] = [current[0], current[1]];
      updated[index] = value;
      return { ...prev, [day]: updated };
    });
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          borderRadius: "8px",
          padding: "24px",
          minWidth: "340px",
          maxWidth: "480px",
          width: "100%",
          boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
        }}
      >
        <h5 style={{ marginBottom: "16px", fontWeight: 600 }}>{course.name}</h5>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ color: "#555", fontSize: "13px" }}>
              <th style={{ textAlign: "left", padding: "4px 8px 8px" }}>Day</th>
              <th style={{ textAlign: "left", padding: "4px 8px 8px" }}>Start</th>
              <th style={{ textAlign: "left", padding: "4px 8px 8px" }}>End</th>
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day) => (
              <tr key={day}>
                <td style={{ padding: "4px 8px" }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={times[day] !== null}
                      onChange={() => toggleDay(day)}
                    />
                    {DAY_LABELS[day]}
                  </label>
                </td>
                <td style={{ padding: "4px 8px" }}>
                  {times[day] && (
                    <input
                      type="time"
                      value={times[day]![0]}
                      onChange={(e) => updateTime(day, 0, e.target.value)}
                    />
                  )}
                </td>
                <td style={{ padding: "4px 8px" }}>
                  {times[day] && (
                    <input
                      type="time"
                      value={times[day]![1]}
                      onChange={(e) => updateTime(day, 1, e.target.value)}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginTop: "20px",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "6px 16px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              cursor: "pointer",
              background: "white",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(times)}
            style={{
              padding: "6px 16px",
              borderRadius: "4px",
              border: "none",
              background: "#0d6efd",
              color: "white",
              cursor: "pointer",
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
