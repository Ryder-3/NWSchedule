import "./AssignmentCard.css";

interface Props {
  name: string;
  dueDate: string;
  course: string;
  onRemove: () => void;
}
function AssignmentCard({ name, dueDate, course, onRemove }: Props) {
  return (
    <div className="card">
      <div className="card-body">
        <button className="remove-button" onClick={onRemove}>
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
