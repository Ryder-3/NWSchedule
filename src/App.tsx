import { useEffect, useState } from "react";
import "./App.css";
import NavBar from "./NavBar";
import AssignmentBar from "./AssignmentBar";
import Calendar from "./Calendar";
import CourseBar from "./CourseBar";
import { getAllAssignments, getCourseList } from "./api/canvasApi";
import type { CanvasAssignment, CourseTime } from "./api/canvas.types";
import type { EventInput, EventChangeArg } from "@fullcalendar/core";
import { getDefaultColor } from "./courseColors";

const DAY_OF_WEEK: Record<keyof CourseTime, number> = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
  thursday: 4, friday: 5, saturday: 6,
};

function buildCourseEvents(
  courseTimes: Record<number, CourseTime>,
  courseColors: Record<number, string>,
  courses: Record<number, string>
): EventInput[] {
  const events: EventInput[] = [];
  for (const [idStr, times] of Object.entries(courseTimes)) {
    const courseId = Number(idStr);
    for (const [day, time] of Object.entries(times) as [keyof CourseTime, [string, string] | null][]) {
      if (!time) continue;
      const color = courseColors[courseId] ?? getDefaultColor(courseId);
      events.push({
        id: `course-${courseId}-${day}`,
        title: courses[courseId] ?? `Course ${courseId}`,
        daysOfWeek: [DAY_OF_WEEK[day]],
        startTime: time[0],
        endTime: time[1],
        backgroundColor: color,
        borderColor: color,
        editable: false,
        extendedProps: { isCourseEvent: true, courseId },
      });
    }
  }
  return events;
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
    return JSON.parse(localStorage.getItem("nws-course-times") ?? "{}");
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

  return (
    <div className="App">
      <NavBar />

      <div className="Main-Content">
        <div className="panel-left">
          <CourseBar
            onColorsChange={handleColorsChange}
            courseTimes={courseTimes}
            onTimesChange={handleTimesChange}
          />
        </div>

        <div className="panel-center">
          <Calendar
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
          <h2 className="assignmentbar-heading">Assignments</h2>
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
  );
}

export default App;
