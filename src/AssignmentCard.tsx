import "./AssignmentCard.css";

interface Props {
  name: string;
  dueDate: string;
}
function AssignmentCard({ name, dueDate }: Props) {
  return (
    <div className="card">
      <div className="card-header">{name}</div>
      <ul className="list-group list-group-flush">
        <li className="list-group-item">{dueDate}</li>
      </ul>
    </div>
  );
}

export default AssignmentCard;
