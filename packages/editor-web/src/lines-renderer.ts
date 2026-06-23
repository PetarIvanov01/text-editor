import {
  comparePositions,
  isSelectionCollapsed,
  Position,
  selectionToRange
} from "@learning-editor/editor-core";
import { Selection } from "@learning-editor/editor-core";
import { getCanvasFont, getCharWidthPx } from "./utils/text-width";
import { Range } from "@learning-editor/editor-core";
import { EditorElements } from "./editor-elements";

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

  constructor(
    private readonly linesElement: HTMLElement,
    private readonly elements: EditorElements
  ) {
    this.lineFont = getCanvasFont(linesElement);
  }

  render(lines: string[], selection: Selection, cursor: Position) {
    const activeLineIndex = selection.active.line;

    const selectedRange = isSelectionCollapsed(selection)
      ? undefined
      : selectionToRange(selection);

    this.linesElement.replaceChildren(
      ...lines.map((line, index) =>
        this.renderLine(
          line,
          index,
          cursor,
          selectedRange,
          index === activeLineIndex
        )
      )
    );
  }

  private renderLine(
    lineText: string,
    lineIndex: number,
    cursor: Position,
    selectedRange: Range | undefined,
    isActive: boolean
  ): HTMLElement {
    const charWidthPx = getCharWidthPx(lineText, this.lineFont);

    const row = this.elements.createRow(isActive);
    const gutter = this.elements.createGutter(lineIndex);
    const text = this.elements.createText();

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
      text.append(highlight);
    }

    const content = document.createElement("span");
    content.className = "line-content";
    content.textContent = lineText.length > 0 ? lineText : " ";
    text.append(content);

    if (cursor.line === lineIndex) {
      const cursorElement = document.createElement("span");
      cursorElement.className = "cursor";
      cursorElement.style.left = `${cursor.column * charWidthPx}px`;
      text.append(cursorElement);
    }

    row.append(gutter, text);
    return row;
  }
}

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
