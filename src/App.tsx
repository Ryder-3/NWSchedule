import { useEffect, useRef, useState } from "react";
import "./App.css";
import NavBar from "./NavBar";
import AssignmentBar from "./AssignmentBar";
import Calendar, { type CalendarHandle } from "./Calendar";
import CourseBar from "./CourseBar";
import { getAllAssignments, getCourseList } from "./api/canvasApi";
import type {
  CanvasAssignment,
  CourseTime,
  CourseTimeSlot,
} from "./api/canvas.types";
import type { EventInput, EventChangeArg } from "@fullcalendar/core";
import { getDefaultColor } from "./courseColors";

const DAY_OF_WEEK: Record<keyof CourseTime, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

function getISOWeek(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// ISO weeks run Mon–Sun, but the calendar grid starts on Sunday.
// Advance Sunday by one day so it shares the same week parity as Mon–Sat in the same visual row.
function getWeekLabel(date: Date): "A" | "B" {
  const d = new Date(date);
  if (d.getDay() === 0) d.setDate(d.getDate() + 1);
  return getISOWeek(d) % 2 === 1 ? "A" : "B";
}

function buildCourseEvents(
  courseTimes: Record<number, CourseTime>,
  courseColors: Record<number, string>,
  courses: Record<number, string>,
): EventInput[] {
  const events: EventInput[] = [];

  const rangeStart = new Date();
  rangeStart.setMonth(rangeStart.getMonth() - 1);
  const rangeEnd = new Date();
  rangeEnd.setMonth(rangeEnd.getMonth() + 13);

  for (const [idStr, times] of Object.entries(courseTimes)) {
    const courseId = Number(idStr);
    const color = courseColors[courseId] ?? getDefaultColor(courseId);
    const title = courses[courseId] ?? `Course ${courseId}`;

    for (const [day, slot] of Object.entries(times) as [
      keyof CourseTime,
      CourseTimeSlot | null,
    ][]) {
      if (!slot) continue;
      const {
        times: [startTime, endTime],
        weeks,
      } = slot;
      const dow = DAY_OF_WEEK[day];

      if (weeks === "every") {
        events.push({
          id: `course-${courseId}-${day}`,
          title,
          daysOfWeek: [dow],
          startTime,
          endTime,
          backgroundColor: color,
          borderColor: color,
          editable: false,
          extendedProps: { isCourseEvent: true, courseId },
        });
      } else {
        // Generate specific date instances for A/B week patterns
        const cursor = new Date(rangeStart);
        while (cursor.getDay() !== dow) cursor.setDate(cursor.getDate() + 1);
        let idx = 0;
        while (cursor <= rangeEnd) {
          if (weeks === getWeekLabel(cursor)) {
            const dateStr = cursor.toISOString().slice(0, 10);
            events.push({
              id: `course-${courseId}-${day}-${idx}`,
              title,
              start: `${dateStr}T${startTime}`,
              end: `${dateStr}T${endTime}`,
              backgroundColor: color,
              borderColor: color,
              editable: false,
              extendedProps: { isCourseEvent: true, courseId },
            });
          }
          cursor.setDate(cursor.getDate() + 7);
          idx++;
        }
      }
    }
  }
  return events;
}

const DAYS_ORDERED = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

function migrateCourseTime(raw: unknown): CourseTime {
  const result: CourseTime = {
    sunday: null,
    monday: null,
    tuesday: null,
    wednesday: null,
    thursday: null,
    friday: null,
    saturday: null,
  };
  if (!raw || typeof raw !== "object") return result;
  for (const day of DAYS_ORDERED) {
    const val = (raw as Record<string, unknown>)[day];
    if (!val) continue;
    if (Array.isArray(val) && val.length === 2) {
      // Old format: [startTime, endTime]
      result[day] = { times: val as [string, string], weeks: "every" };
    } else if (
      val &&
      typeof val === "object" &&
      "times" in val &&
      "weeks" in val
    ) {
      result[day] = val as CourseTimeSlot;
    }
  }
  return result;
}

function loadCourseColors(): Record<number, string> {
  try {
    return JSON.parse(localStorage.getItem("nws-course-colors") ?? "{}");
  } catch {
    return {};
  }
}

function loadCourseTimes(): Record<number, CourseTime> {
  try {
    const raw = JSON.parse(localStorage.getItem("nws-course-times") ?? "{}");
    const result: Record<number, CourseTime> = {};
    for (const [id, ct] of Object.entries(raw)) {
      result[Number(id)] = migrateCourseTime(ct);
    }
    return result;
  } catch {
    return {};
  }
}

function App() {
  const [assignments, setAssignments] = useState<CanvasAssignment[]>([]);
  const [courses, setCourses] = useState<Record<number, string>>([]);
  const [calendarEvents, setCalendarEvents] = useState<EventInput[]>([]);
  const [courseColors, setCourseColors] =
    useState<Record<number, string>>(loadCourseColors);
  const [courseTimes, setCourseTimes] =
    useState<Record<number, CourseTime>>(loadCourseTimes);

  const handleColorsChange = (colors: Record<number, string>) => {
    setCourseColors(colors);
  };

  const handleTimesChange = (times: Record<number, CourseTime>) => {
    setCourseTimes(times);
  };

  useEffect(() => {
    getAllAssignments().then(setAssignments);
    getCourseList().then(setCourses);
  }, []);

  const handleRemoveEvent = (id: string) => {
    setCalendarEvents((prev) => prev.filter((e) => e.id !== id));
  };
  const handleChangeElement = (changeInfo: EventChangeArg) => {
    const newEvent = changeInfo.event.toPlainObject();
    setCalendarEvents((prev) => prev.filter((e) => e.id !== newEvent.id));
    setCalendarEvents((prev) => [...prev, newEvent]);
  };

  const [assignmentsCollapsed, setAssignmentsCollapsed] = useState(false);
  const calendarRef = useRef<CalendarHandle>(null);

  useEffect(() => {
    const duration = 350;
    const start = performance.now();
    let frameId: number;
    const tick = (now: number) => {
      calendarRef.current?.updateSize();
      if (now - start < duration) frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [assignmentsCollapsed]);

  return (
    <div className="App">
      <NavBar />

      <div className={`Main-Content${assignmentsCollapsed ? " assignments-collapsed" : ""}`}>
        <div className="panel-left">
          <h2 className="bar-heading">Courses</h2>
          <CourseBar
            onColorsChange={handleColorsChange}
            courseTimes={courseTimes}
            onTimesChange={handleTimesChange}
          />
        </div>

        <div className="panel-center">
          <Calendar
            ref={calendarRef}
            events={[
              ...calendarEvents.map((e) => {
                const courseId = (e.extendedProps as { courseId?: number })
                  ?.courseId;
                const color =
                  courseId != null
                    ? (courseColors[courseId] ?? getDefaultColor(courseId))
                    : undefined;
                return color
                  ? { ...e, backgroundColor: color, borderColor: color }
                  : e;
              }),
              ...buildCourseEvents(courseTimes, courseColors, courses),
            ]}
            onEventReceive={(arg) => {
              const id = crypto.randomUUID();
              const event = { ...arg.event.toPlainObject(), id };
              arg.event.remove();
              setCalendarEvents((prev) => [...prev, event]);
            }}
            onRemoveEvent={handleRemoveEvent}
            onEventChange={handleChangeElement}
          />
        </div>

        <div className="panel-right">
          <button
            className="collapse-button"
            onClick={() => setAssignmentsCollapsed((v) => !v)}
          >
            <img
              src={
                assignmentsCollapsed
                  ? "/expand-right-svgrepo-com.svg"
                  : "/collapse-right-svgrepo-com.svg"
              }
              alt={assignmentsCollapsed ? "expand" : "collapse"}
              className="icon"
            />
          </button>

          <div className="panel-right-content">
            <h2 className="bar-heading">Assignments</h2>
            <AssignmentBar
              assignments={assignments}
              courses={courses}
              courseColors={courseColors}
              onRemove={(id) =>
                setAssignments((prev) => prev.filter((a) => a.id !== id))
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
