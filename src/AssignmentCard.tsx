import "./AssignmentCard.css";

interface Props {
  name: string;
  dueDate: string;
  course: string;
  color?: string;
  onRemove: () => void;
  onClick: () => void;
}

function AssignmentCard({ name, dueDate, course, color, onRemove, onClick }: Props) {
  return (
    <div
      className="card"
      style={color ? { borderLeft: `4px solid ${color}` } : undefined}
      onClick={onClick}
    >
      <div className="card-body">
        <button
          className="remove-button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
        >
          X
        </button>
        <h5 className="card-title nws-title">{name}</h5>
        <p className="card-text">{dueDate}</p>
        <h6 className="card-subtitle">{course}</h6>
      </div>
    </div>
  );
}

export default AssignmentCard;
