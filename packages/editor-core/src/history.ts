import type { Position } from "./position";
import type { Selection } from "./selection";

export interface EditorSnapshot {
  lines: string[];
  selection: Selection;
  preferredColumn: number | undefined;
}

export class History {
  private readonly undoStack: EditorSnapshot[] = [];
  private readonly redoStack: EditorSnapshot[] = [];

  push(snapshot: EditorSnapshot): void {
    this.undoStack.push(cloneSnapshot(snapshot));
    this.redoStack.length = 0;
  }

  undo(current: EditorSnapshot): EditorSnapshot | undefined {
    const previous = this.undoStack.pop();
    if (!previous) {
      return undefined;
    }

    this.redoStack.push(cloneSnapshot(current));
    return cloneSnapshot(previous);
  }

  redo(current: EditorSnapshot): EditorSnapshot | undefined {
    const next = this.redoStack.pop();
    if (!next) {
      return undefined;
    }

    this.undoStack.push(cloneSnapshot(current));
    return cloneSnapshot(next);
  }
}

function clonePosition(position: Position): Position {
  return { line: position.line, column: position.column };
}

function cloneSelection(selection: Selection): Selection {
  return {
    anchor: clonePosition(selection.anchor),
    active: clonePosition(selection.active)
  };
}

export function cloneSnapshot(snapshot: EditorSnapshot): EditorSnapshot {
  return {
    lines: [...snapshot.lines],
    selection: cloneSelection(snapshot.selection),
    preferredColumn: snapshot.preferredColumn
  };
}
