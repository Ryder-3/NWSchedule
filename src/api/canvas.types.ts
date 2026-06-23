// Canvas LMS REST API response shapes
// Reference: https://canvas.instructure.com/doc/api/

export interface CanvasUser {
  id: number;
  name: string;
  short_name: string;
  login_id: string;
  email: string;
  avatar_url: string;
}

export interface CanvasCourse {
  id: number;
  name: string;
  course_code: string;
  start_at: string | null;   // ISO 8601
  end_at: string | null;
  workflow_state: "available" | "completed" | "deleted";
  enrollment_term_id: number;
  uuid: string;
  // color is not returned by the API — you set it locally per course
  color?: string;
}

export interface CanvasAssignment {
  id: number;
  name: string;
  description: string | null;
  due_at: string | null;        // ISO 8601
  points_possible: number;
  course_id: number;
  html_url: string;
  submission_types: SubmissionType[];
  workflow_state: "published" | "unpublished" | "deleted";
  grading_type: "points" | "percent" | "pass_fail" | "not_graded";
  omit_from_final_grade: boolean;
}

export type SubmissionType =
  | "online_upload"
  | "online_text_entry"
  | "online_url"
  | "media_recording"
  | "none"
  | "on_paper"
  | "discussion_topic"
  | "not_graded";

export interface CanvasCalendarEvent {
  id: number;
  title: string;
  start_at: string;   // ISO 8601
  end_at: string;
  type: "event" | "assignment";
  workflow_state: "active" | "locked" | "deleted";
  context_code: string;         // e.g. "course_1234"
  course_id: number | null;
  description: string | null;
  location_name: string | null;
  location_address: string | null;
  // Present only when type === "assignment"
  assignment?: Pick<CanvasAssignment, "id" | "name" | "due_at" | "points_possible" | "course_id">;
}

export interface CanvasSubmission {
  id: number;
  assignment_id: number;
  user_id: number;
  submitted_at: string | null;
  workflow_state: "submitted" | "unsubmitted" | "graded" | "pending_review";
  score: number | null;
  grade: string | null;
  late: boolean;
  missing: boolean;
}
