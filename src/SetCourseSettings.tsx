import { useState, useEffect } from "react";
import { CanvasCourse, CourseTime } from "./api/canvas.types";
import { getCourses } from "./api/canvasApi";
import { getDefaultColor } from "./courseColors";
import CourseTimeSetter from "./CourseTimeSetter";
import "./SetCourseSettings.css";

interface Props {
  onColorsChange: (colors: Record<number, string>) => void;
  courseTimes: Record<number, CourseTime>;
  onTimesChange: (times: Record<number, CourseTime>) => void;
}

function loadSavedColors(): Record<number, string> {
  try {
    return JSON.parse(localStorage.getItem("nws-course-colors") ?? "{}");
  } catch {
    return {};
  }
}

export default function SetCourseSettings({
  onColorsChange,
  courseTimes,
  onTimesChange,
}: Props) {
  const [courses, setCourses] = useState<CanvasCourse[]>([]);
  const [colors, setColors] = useState<Record<number, string>>(loadSavedColors);
  const [selectedCourse, setSelectedCourse] = useState<CanvasCourse | null>(
    null,
  );

  useEffect(() => {
    getCourses().then(setCourses);
  }, []);

  const handleColorChange = (courseId: number, color: string) => {
    const updated = { ...colors, [courseId]: color };
    setColors(updated);
    localStorage.setItem("nws-course-colors", JSON.stringify(updated));
    onColorsChange(updated);
  };

  const handleSaveTimes = (times: CourseTime) => {
    if (!selectedCourse) return;
    const updated = { ...courseTimes, [selectedCourse.id]: times };
    localStorage.setItem("nws-course-times", JSON.stringify(updated));
    onTimesChange(updated);
    setSelectedCourse(null);
  };

  return (
    <>
      <ul className="list-unstyled">
        {courses.map((course) => (
          <li
            key={course.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "10px",
            }}
          >
            <input
              type="color"
              value={colors[course.id] ?? getDefaultColor(course.id)}
              onChange={(e) => handleColorChange(course.id, e.target.value)}
              style={{
                width: "36px",
                minWidth: "36px",
                height: "36px",
                minHeight: "36px",
                flexShrink: 0,
                padding: "2px",
                border: "none",
                cursor: "pointer",
              }}
            />
            <button
              className="course-name-btn"
              onClick={() => setSelectedCourse(course)}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                textAlign: "left",
                font: "inherit",
                color: "inherit",
                textDecoration: courseTimes[course.id] ? "none" : "none",
              }}
              title="Click to set schedule"
            >
              {course.name}
            </button>
          </li>
        ))}
      </ul>

      {selectedCourse && (
        <CourseTimeSetter
          course={selectedCourse}
          initialTimes={courseTimes[selectedCourse.id] ?? null}
          onSave={handleSaveTimes}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </>
  );
}
