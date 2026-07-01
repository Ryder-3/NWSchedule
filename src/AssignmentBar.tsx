import { useEffect, useRef, useState } from "react";
import { Draggable } from "@fullcalendar/interaction";
import AssignmentCard from "./AssignmentCard";
import AssignmentDescription from "./AssignmentDescription";
import "./AssignmentBar.css";
import type { CanvasAssignment } from "./api/canvas.types";
import { getDefaultColor } from "./courseColors";

interface Props {
  assignments: CanvasAssignment[];
  courses: Record<number, string>;
  courseColors: Record<number, string>;
  onRemove: (id: number) => void;
}

function AssignmentBar({ assignments, courses, courseColors, onRemove }: Props) {
  const containerRef = useRef<HTMLUListElement>(null);
  const [selected, setSelected] = useState<CanvasAssignment | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const draggable = new Draggable(containerRef.current, {
      itemSelector: ".fc-event",
      eventData: (el) => ({
        title: el.dataset.title,
        duration: "01:00",
        backgroundColor: el.dataset.color || undefined,
        borderColor: el.dataset.color || undefined,
        extendedProps: {
          course: el.dataset.course,
          courseId: Number(el.dataset.courseid),
          dueDate: el.dataset.duedate,
        },
      }),
    });
    return () => draggable.destroy();
  }, [assignments]);

  const selectedColor = selected
    ? courseColors[selected.course_id] ?? getDefaultColor(selected.course_id)
    : "";

  return (
    <>
      <ul className="assignment-bar" ref={containerRef}>
        {assignments.map((a) => (
          <li
            key={a.id}
            className="fc-event"
            data-title={a.name}
            data-course={courses[a.course_id]}
            data-courseid={a.course_id}
            data-color={courseColors[a.course_id] ?? getDefaultColor(a.course_id)}
            data-duedate={
              a.due_at ? new Date(a.due_at).toLocaleDateString() : "No due date"
            }
          >
            <AssignmentCard
              name={a.name}
              dueDate={
                a.due_at ? new Date(a.due_at).toLocaleDateString() : "No due date"
              }
              course={courses[a.course_id]}
              color={courseColors[a.course_id] ?? getDefaultColor(a.course_id)}
              onRemove={() => onRemove(a.id)}
              onClick={() => setSelected(a)}
            />
          </li>
        ))}
      </ul>
      <AssignmentDescription
        assignment={selected}
        course={selected ? (courses[selected.course_id] ?? "") : ""}
        color={selectedColor}
        onClose={() => setSelected(null)}
      />
    </>
  );
}

export default AssignmentBar;
