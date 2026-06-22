import { positionsEqual, type Position } from "./position";
import { normalizeRange, type Range } from "./range";

export interface Selection {
  anchor: Position;
  active: Position;
}

export function collapsedSelection(position: Position): Selection {
  return { anchor: position, active: position };
}

export function isSelectionCollapsed(selection: Selection): boolean {
  return positionsEqual(selection.anchor, selection.active);
}

export function selectionToRange(selection: Selection): Range {
  return normalizeRange({ start: selection.anchor, end: selection.active });
}
