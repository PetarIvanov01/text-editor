import {
  comparePositions,
  isSelectionCollapsed,
  selectionToRange,
  type EditorState,
  type Position,
  type Range
} from "@learning-editor/editor-core";

const charWidthPx = 8.4;

export class EditorRenderer {
  constructor(
    private readonly editor: EditorState,
    private readonly linesElement: HTMLElement,
    private readonly statusElement: HTMLElement
  ) {}

  render(): void {
    const lines = this.editor.getLines();
    const selection = this.editor.getSelection();
    const cursor = this.editor.getCursor();
    const selectedRange = isSelectionCollapsed(selection)
      ? undefined
      : selectionToRange(selection);

    this.linesElement.replaceChildren(
      ...lines.map((line, index) =>
        this.renderLine(line, index, cursor, selectedRange)
      )
    );

    this.statusElement.textContent = `Line ${cursor.line + 1}, Column ${
      cursor.column + 1
    }`;
  }

  private renderLine(
    lineText: string,
    lineIndex: number,
    cursor: Position,
    selectedRange: Range | undefined
  ): HTMLElement {
    const row = document.createElement("div");
    row.className = "editor-row";

    const gutter = document.createElement("div");
    gutter.className = "editor-gutter";
    gutter.textContent = String(lineIndex + 1);

    const text = document.createElement("div");
    text.className = "editor-text";

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
