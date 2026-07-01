import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactablePlugin from "@fullcalendar/interaction";
import type { EventInput, EventChangeArg } from "@fullcalendar/core";
import { forwardRef, useImperativeHandle, useRef } from "react";
import "./Calendar.css";

interface Props {
  events: EventInput[];
  onEventReceive: (arg: {
    event: { toPlainObject: () => EventInput; remove: () => void };
  }) => void;
  onRemoveEvent: (eventId: string) => void;
  onEventChange: (changeInfo: EventChangeArg) => void;
}

export interface CalendarHandle {
  updateSize: () => void;
}

const Calendar = forwardRef<CalendarHandle, Props>(function Calendar({
  events,
  onEventReceive,
  onRemoveEvent,
  onEventChange,
}, ref) {
  const fcRef = useRef<FullCalendar>(null);

  useImperativeHandle(ref, () => ({
    updateSize: () => fcRef.current?.getApi().updateSize(),
  }));

  return (
    <div className="nws-calendar">
      <FullCalendar
        ref={fcRef}
        plugins={[timeGridPlugin, dayGridPlugin, interactablePlugin]}
        initialView="timeGridWeek"
        nowIndicator
        droppable
        editable
        events={events}
        eventContent={(info) => (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "2px 4px",
            }}
          >
            <span>{info.event.title}</span>
            {!info.event.extendedProps.isCourseEvent && (
              <button
                onClick={() => {
                  info.event.remove();
                  onRemoveEvent(info.event.id);
                }}
              >
                ✕
              </button>
            )}
          </div>
        )}
        eventReceive={onEventReceive}
        eventChange={onEventChange}
        headerToolbar={{
          start: "timeGridDay,timeGridWeek,dayGridMonth",
          center: "title",
          end: "today prev,next",
        }}
      />
    </div>
  );
});

export default Calendar;
