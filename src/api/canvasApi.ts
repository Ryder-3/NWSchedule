import type {
  CanvasUser,
  CanvasCourse,
  CanvasAssignment,
  CanvasCalendarEvent,
} from "./canvas.types";
import {
  mockUser,
  mockCourses,
  mockAssignments,
  mockCalendarEvents,
} from "./canvas.mockData";

// ---------------------------------------------------------------------------
// Config — set VITE_USE_MOCK=true in .env to use local mock data.
// When you have a real Canvas account, set:
//   VITE_USE_MOCK=false
//   VITE_CANVAS_BASE_URL=https://yourschool.instructure.com
//   VITE_CANVAS_TOKEN=<your Canvas API token>
// ---------------------------------------------------------------------------
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
const BASE_URL = (import.meta.env.VITE_CANVAS_BASE_URL ?? "").replace(/\/$/, "");
const TOKEN = import.meta.env.VITE_CANVAS_TOKEN ?? "";

async function canvasFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}/api/v1${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!res.ok) throw new Error(`Canvas API ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Fetch the currently authenticated user. */
export async function getCurrentUser(): Promise<CanvasUser> {
  if (USE_MOCK) return mockUser;
  return canvasFetch<CanvasUser>("/users/self");
}

/** Fetch all active courses for the current user. */
export async function getCourses(): Promise<CanvasCourse[]> {
  if (USE_MOCK) return mockCourses;
  return canvasFetch<CanvasCourse[]>("/courses", {
    enrollment_state: "active",
    per_page: "50",
  });
}

/** Fetch all active courses and return a map of course id → course name. */
export async function getCourseList(): Promise<Record<number, string>> {
  const courses = await getCourses();
  const ret: Record<number, string> = {};
  for (const course of courses) {
    ret[course.id] = course.name;
  }
  return ret;
}

/** Fetch all assignments for a single course. */
export async function getAssignments(courseId: number): Promise<CanvasAssignment[]> {
  if (USE_MOCK) return mockAssignments.filter((a) => a.course_id === courseId);
  return canvasFetch<CanvasAssignment[]>(`/courses/${courseId}/assignments`, {
    per_page: "100",
    order_by: "due_at",
  });
}

/** Fetch assignments across all active courses and return them sorted by due date. */
export async function getAllAssignments(): Promise<CanvasAssignment[]> {
  if (USE_MOCK) {
    return [...mockAssignments].sort((a, b) => {
      if (!a.due_at) return 1;
      if (!b.due_at) return -1;
      return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
    });
  }
  const courses = await getCourses();
  const nested = await Promise.all(courses.map((c) => getAssignments(c.id)));
  return nested
    .flat()
    .sort((a, b) => {
      if (!a.due_at) return 1;
      if (!b.due_at) return -1;
      return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
    });
}

/**
 * Fetch calendar events (lectures, office hours, etc.) within a date range.
 * Dates should be ISO 8601 strings, e.g. "2026-06-17T00:00:00Z".
 */
export async function getCalendarEvents(
  startDate: string,
  endDate: string,
): Promise<CanvasCalendarEvent[]> {
  if (USE_MOCK) {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    return mockCalendarEvents.filter((e) => {
      const t = new Date(e.start_at).getTime();
      return t >= start && t <= end;
    });
  }
  return canvasFetch<CanvasCalendarEvent[]>("/calendar_events", {
    type: "event",
    start_date: startDate,
    end_date: endDate,
    per_page: "100",
    all_events: "true",
  });
}

/**
 * Fetch assignment-type calendar events (Canvas surfaces assignments as
 * calendar entries too) within a date range.
 */
export async function getAssignmentCalendarEvents(
  startDate: string,
  endDate: string,
): Promise<CanvasCalendarEvent[]> {
  if (USE_MOCK) {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    return mockAssignments
      .filter((a) => {
        if (!a.due_at) return false;
        const t = new Date(a.due_at).getTime();
        return t >= start && t <= end;
      })
      .map((a) => ({
        id: a.id + 90000,
        title: a.name,
        start_at: a.due_at!,
        end_at: a.due_at!,
        type: "assignment" as const,
        workflow_state: "active" as const,
        context_code: `course_${a.course_id}`,
        course_id: a.course_id,
        description: a.description,
        location_name: null,
        location_address: null,
        assignment: {
          id: a.id,
          name: a.name,
          due_at: a.due_at,
          points_possible: a.points_possible,
          course_id: a.course_id,
        },
      }));
  }
  return canvasFetch<CanvasCalendarEvent[]>("/calendar_events", {
    type: "assignment",
    start_date: startDate,
    end_date: endDate,
    per_page: "100",
    all_events: "true",
  });
}
