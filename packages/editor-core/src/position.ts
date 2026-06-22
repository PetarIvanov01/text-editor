export interface Position {
  line: number;
  column: number;
}

export function position(line: number, column: number): Position {
  return { line, column };
}

export function comparePositions(a: Position, b: Position): number {
  if (a.line !== b.line) {
    return a.line - b.line;
  }

  return a.column - b.column;
}

export function positionsEqual(a: Position, b: Position): boolean {
  return a.line === b.line && a.column === b.column;
}
