import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import "./AssignmentDescription.css";
import type { CanvasAssignment } from "./api/canvas.types";

interface Props {
  assignment: CanvasAssignment | null;
  course: string;
  color: string;
  onClose: () => void;
}

export default function AssignmentDescription({
  assignment,
  course,
  color,
  onClose,
}: Props) {
  const dueDate = assignment?.due_at
    ? new Date(assignment.due_at).toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "No due date";

  return (
    <Modal show={assignment !== null} onHide={onClose} centered>
      <Modal.Header closeButton style={{ borderBottom: `4px solid ${color}` }}>
        <Modal.Title>{assignment?.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="ad-meta">
          <span className="ad-course" style={{ color }}>
            {course}
          </span>
          <span className="ad-due">{dueDate}</span>
        </div>
        {assignment?.description ? (
          <div
            className="ad-description"
            dangerouslySetInnerHTML={{ __html: assignment.description }}
          />
        ) : (
          <p className="text fst-italic">No description provided.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button
          href={assignment?.html_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ backgroundColor: color, borderColor: color }}
        >
          Open in Canvas →
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
