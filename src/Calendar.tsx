import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactablePlugin from "@fullcalendar/interaction";
import type { EventInput, EventChangeArg } from "@fullcalendar/core";

interface Props {
  events: EventInput[];
  onEventReceive: (arg: {
    event: { toPlainObject: () => EventInput; remove: () => void };
  }) => void;
  onRemoveEvent: (eventId: string) => void;
  onEventChange: (changeInfo: EventChangeArg) => void;
}

export default function Calendar({
  events,
  onEventReceive,
  onRemoveEvent,
  onEventChange,
}: Props) {
  return (
    <FullCalendar
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
          <button
            onClick={() => {
              info.event.remove();
              onRemoveEvent(info.event.id);
            }}
          >
            ✕
          </button>
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
  );
}
