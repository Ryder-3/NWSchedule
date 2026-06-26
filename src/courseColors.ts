const DEFAULT_PALETTE = [
  "#4e79a7", "#f28e2b", "#e15759", "#76b7b2",
  "#59a14f", "#edc948", "#b07aa1", "#ff9da7",
  "#9c755f", "#bab0ac",
];

export function getDefaultColor(courseId: number): string {
  return DEFAULT_PALETTE[courseId % DEFAULT_PALETTE.length];
}
