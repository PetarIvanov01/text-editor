import type { Position } from "./position";
import { normalizeRange, type Range } from "./range";
import type { TextEdit } from "./textEdit";

export interface ApplyEditResult {
  deletedText: string;
  endPosition: Position;
}

export class TextModel {
  private lines: string[];

  constructor(text = "") {
    this.lines = splitText(text);
  }

  getLines(): string[] {
    return [...this.lines];
  }

  setLines(lines: string[]): void {
    this.lines = lines.length > 0 ? [...lines] : [""];
  }

  getText(): string {
    return this.lines.join("\n");
  }

  lineCount(): number {
    return this.lines.length;
  }

  getLine(line: number): string {
    return this.lines[line] ?? "";
  }

  clampPosition(position: Position): Position {
    const line = clamp(position.line, 0, this.lines.length - 1);
    const column = clamp(position.column, 0, this.lines[line].length);
    return { line, column };
  }

  positionLeft(position: Position): Position {
    const current = this.clampPosition(position);
    if (current.column > 0) {
      return { line: current.line, column: current.column - 1 };
    }

    if (current.line === 0) {
      return current;
    }

    const previousLine = current.line - 1;
    return { line: previousLine, column: this.lines[previousLine].length };
  }

  positionRight(position: Position): Position {
    const current = this.clampPosition(position);
    if (current.column < this.lines[current.line].length) {
      return { line: current.line, column: current.column + 1 };
    }

    if (current.line === this.lines.length - 1) {
      return current;
    }

    return { line: current.line + 1, column: 0 };
  }

  positionUp(position: Position, preferredColumn = position.column): Position {
    const current = this.clampPosition(position);
    if (current.line === 0) {
      return current;
    }

    const line = current.line - 1;
    return { line, column: Math.min(preferredColumn, this.lines[line].length) };
  }

  positionDown(position: Position, preferredColumn = position.column): Position {
    const current = this.clampPosition(position);
    if (current.line === this.lines.length - 1) {
      return current;
    }

    const line = current.line + 1;
    return { line, column: Math.min(preferredColumn, this.lines[line].length) };
  }

  getTextInRange(range: Range): string {
    const normalized = this.clampRange(normalizeRange(range));
    const { start, end } = normalized;

    if (start.line === end.line) {
      return this.lines[start.line].slice(start.column, end.column);
    }

    const parts = [
      this.lines[start.line].slice(start.column),
      ...this.lines.slice(start.line + 1, end.line),
      this.lines[end.line].slice(0, end.column)
    ];

    return parts.join("\n");
  }

  applyEdit(edit: TextEdit): ApplyEditResult {
    const range = this.clampRange(normalizeRange(edit.range));
    const deletedText = this.getTextInRange(range);
    const insertedLines = splitText(edit.text);
    const { start, end } = range;
    const before = this.lines[start.line].slice(0, start.column);
    const after = this.lines[end.line].slice(end.column);

    // Text insertion is expressed as replacing a range. A single-line insert
    // stays in the current line; a multiline insert splices new rows between
    // the prefix before the range and the suffix after the range.
    if (insertedLines.length === 1) {
      this.lines.splice(
        start.line,
        end.line - start.line + 1,
        before + insertedLines[0] + after
      );
    } else {
      const replacement = [
        before + insertedLines[0],
        ...insertedLines.slice(1, -1),
        insertedLines[insertedLines.length - 1] + after
      ];
      this.lines.splice(start.line, end.line - start.line + 1, ...replacement);
    }

    return {
      deletedText,
      endPosition: positionAfterInsertedText(start, edit.text)
    };
  }

  private clampRange(range: Range): Range {
    return {
      start: this.clampPosition(range.start),
      end: this.clampPosition(range.end)
    };
  }
}

function splitText(text: string): string[] {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return normalized.split("\n");
}

function positionAfterInsertedText(start: Position, text: string): Position {
  const insertedLines = splitText(text);
  if (insertedLines.length === 1) {
    return { line: start.line, column: start.column + insertedLines[0].length };
  }

  return {
    line: start.line + insertedLines.length - 1,
    column: insertedLines[insertedLines.length - 1].length
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
