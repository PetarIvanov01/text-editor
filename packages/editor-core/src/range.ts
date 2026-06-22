import { comparePositions, type Position } from "./position";

export interface Range {
  start: Position;
  end: Position;
}

export function normalizeRange(range: Range): Range {
  return comparePositions(range.start, range.end) <= 0
    ? range
    : { start: range.end, end: range.start };
}

export function isRangeEmpty(range: Range): boolean {
  return comparePositions(range.start, range.end) === 0;
}
