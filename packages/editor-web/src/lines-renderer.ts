import {
  comparePositions,
  isSelectionCollapsed,
  selectionToRange,
  type Selection,
  type Range
} from "@learning-editor/editor-core";
import { type EditorElements } from "./editor-elements";
import { getCanvasFont, getCharWidthPx } from "./utils/text-width";

type RenderedRow = {
  row: HTMLElement;
  gutter: HTMLElement;
  text: HTMLElement;
  content: HTMLElement;
  cursor?: HTMLElement;
  highlight?: HTMLElement;
};

export class LinesRenderer {
  private readonly lineFont: string;
  private rows: RenderedRow[] = [];
  private currentLines: string[] = [];
  private currentSelection: Selection | undefined;

  constructor(
    private readonly linesElement: HTMLElement,
    private readonly elements: EditorElements
  ) {
    this.lineFont = getCanvasFont(linesElement);
  }

  /**
   * Syncs all rendered rows with a full editor snapshot. This is used for the
   * initial render and full-sync cases, and it refreshes the cached lines,
   * selection, row count, and visual state for every row.
   */
  sync(lines: string[], selection: Selection) {
    this.currentLines = [...lines];
    this.currentSelection = selection;
    this.syncRowCount(lines.length);

    for (let index = 0; index < lines.length; index++) {
      this.updateRenderedRow(index, lines[index], selection);
    }
  }

  /**
   * Updates one cached row after a `lineChanged` event. The stored line text is
   * updated first so later selection updates use the latest content.
   */
  updateLine(lineIndex: number, lineText: string): void {
    const row = this.rows[lineIndex];
    if (!row || !this.currentSelection) {
      return;
    }

    this.currentLines[lineIndex] = lineText;
    this.updateRenderedRow(lineIndex, lineText, this.currentSelection);
  }

  /**
   * Updates only the rows touched by the previous or current selection. This
   * clears old cursor/highlight state and draws the new selection state without
   * touching unrelated lines.
   */
  updateSelection(previous: Selection, current: Selection): void {
    this.currentSelection = current;

    for (const lineIndex of getAffectedSelectionLines(previous, current)) {
      const lineText = this.currentLines[lineIndex];
      if (lineText !== undefined) {
        this.updateRenderedRow(lineIndex, lineText, current);
      }
    }
  }

  /**
   * Makes the cached row list match the requested line count, creating or
   * removing DOM rows so this.rows stays aligned with line indexes.
   */
  private syncRowCount(count: number): void {
    while (this.rows.length < count) {
      const row = this.createRenderedRow(this.rows.length);
      this.rows.push(row);
      this.linesElement.append(row.row);
    }

    while (this.rows.length > count) {
      const row = this.rows.pop();
      row?.row.remove();
    }
  }

  /**
   * Creates the DOM structure for one row and returns references to the parts
   * that later updates need to reuse.
   */
  private createRenderedRow(lineIndex: number): RenderedRow {
    const row = this.elements.createRow();
    const gutter = this.elements.createGutter(lineIndex);
    const text = this.elements.createText();
    const content = document.createElement("span");
    content.className = "line-content";

    text.append(content);
    row.append(gutter, text);

    return { row, gutter, text, content };
  }

  /**
   * Reconciles one cached row with the latest line text and selection. It
   * refreshes row styling, gutter text, content, selection highlight, and cursor.
   */
  private updateRenderedRow(
    lineIndex: number,
    lineText: string,
    selection: Selection
  ): void {
    const renderedRow = this.rows[lineIndex];
    if (!renderedRow) {
      return;
    }

    const cursor = selection.active;
    const activeLineIndex = cursor.line;
    const selectedRange = isSelectionCollapsed(selection)
      ? undefined
      : selectionToRange(selection);
    const charWidthPx = getCharWidthPx(lineText, this.lineFont);

    renderedRow.row.classList.toggle("selected", lineIndex === activeLineIndex);
    renderedRow.gutter.textContent = String(lineIndex + 1);
    renderedRow.content.textContent = lineText.length > 0 ? lineText : " ";

    renderedRow.highlight?.remove();
    renderedRow.cursor?.remove();
    renderedRow.highlight = undefined;
    renderedRow.cursor = undefined;

    const selectionBounds = selectedRange
      ? getLineSelectionBounds(lineText, lineIndex, selectedRange)
      : undefined;

    if (selectionBounds) {
      const highlight = document.createElement("span");
      highlight.className = "selection-highlight";
      highlight.style.left = `${selectionBounds.start * charWidthPx}px`;
      highlight.style.width = `${
        Math.max(selectionBounds.end - selectionBounds.start, 0.35) *
        charWidthPx
      }px`;
      renderedRow.text.prepend(highlight);
      renderedRow.highlight = highlight;
    }

    if (cursor.line === lineIndex) {
      const cursorElement = document.createElement("span");
      cursorElement.className = "cursor";
      cursorElement.style.left = `${cursor.column * charWidthPx}px`;
      renderedRow.text.append(cursorElement);
      renderedRow.cursor = cursorElement;
    }
  }
}

/**
 * Calculates the selected column range for one line, or returns undefined when
 * the selection does not touch that line.
 */
function getLineSelectionBounds(
  lineText: string,
  lineIndex: number,
  range: Range
): { start: number; end: number } | undefined {
  const lineStart = { line: lineIndex, column: 0 };
  const lineEnd = { line: lineIndex, column: lineText.length };

  if (
    comparePositions(range.end, lineStart) < 0 ||
    comparePositions(range.start, lineEnd) > 0
  ) {
    return undefined;
  }

  const start = range.start.line === lineIndex ? range.start.column : 0;
  const end = range.end.line === lineIndex ? range.end.column : lineText.length;

  if (start === end && range.start.line !== range.end.line) {
    return { start, end: start + 0.35 };
  }

  return { start, end };
}

/**
 * Collects every line index that may need visual updates after a selection
 * change, including previous and current selection ranges.
 */
function getAffectedSelectionLines(
  previous: Selection,
  current: Selection
): number[] {
  const lines = new Set<number>();
  addSelectionLines(lines, previous);
  addSelectionLines(lines, current);
  return [...lines];
}

/**
 * Adds every line touched by a selection range to the provided Set.
 */
function addSelectionLines(lines: Set<number>, selection: Selection): void {
  const range = selectionToRange(selection);
  const start = Math.min(range.start.line, range.end.line);
  const end = Math.max(range.start.line, range.end.line);

  for (let line = start; line <= end; line += 1) {
    lines.add(line);
  }
}
