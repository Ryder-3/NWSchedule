import { useEffect, useState } from "react";
import "./App.css";
import NavBar from "./NavBar";
import AssignmentBar from "./AssignmentBar";
import Calendar from "./Calendar";
import { getAllAssignments, getCourseList } from "./api/canvasApi";
import type { CanvasAssignment } from "./api/canvas.types";
import type { EventInput, EventChangeArg } from "@fullcalendar/core";

function App() {
  const [assignments, setAssignments] = useState<CanvasAssignment[]>([]);
  const [courses, setCourses] = useState<Record<number, string>>([]);
  const [calendarEvents, setCalendarEvents] = useState<EventInput[]>([]);

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
    console.log("Event Changed");
  };

  return (
    <div className="App">
      <NavBar />

      <div className="Main-Content">
        <div className="panel-left">
          <h1>Class settings, and the like</h1>
        </div>

        <div className="panel-center">
          <Calendar
            events={calendarEvents}
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
