import AssignmentCard from "./AssignmentCard";
import "./SideBar.css";

function SideBar() {
  return (
    <ul>
      <li>
        <AssignmentCard name="test" dueDate="1.1.1" />
      </li>
      <li>assignment 2</li>
      <li>assignment 3</li>
      <li>assignment 4</li>
    </ul>
  );
}

export default SideBar;
