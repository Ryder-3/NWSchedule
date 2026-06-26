import { CourseTime } from "./api/canvas.types";
import SetCourseSettings from "./SetCourseSettings";
import Button from "react-bootstrap/Button";

interface Props {
  onColorsChange: (colors: Record<number, string>) => void;
  courseTimes: Record<number, CourseTime>;
  onTimesChange: (times: Record<number, CourseTime>) => void;
}

function CourseBar({ onColorsChange, courseTimes, onTimesChange }: Props) {
  return (
    <>
      <SetCourseSettings
        onColorsChange={onColorsChange}
        courseTimes={courseTimes}
        onTimesChange={onTimesChange}
      />
      <Button>Add Event</Button>
    </>
  );
}

export default CourseBar;
