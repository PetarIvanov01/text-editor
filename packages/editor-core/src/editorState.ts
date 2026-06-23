import type { EditorAction } from "./actions";
import { EditorChange, EditorChangeEvent } from "./editorChanges";
import { Emitter, type Disposable, type Listener } from "./events";
import { cloneSnapshot, History, type EditorSnapshot } from "./history";
import { comparePositions, type Position } from "./position";
import type { Range } from "./range";
import {
  collapsedSelection,
  isSelectionCollapsed,
  selectionToRange,
  type Selection
} from "./selection";
import { TextModel } from "./textModel";

type MoveCursorAction = Extract<EditorAction, { type: "moveCursor" }>;

export class EditorState {
  private readonly model: TextModel;
  private readonly history = new History();
  private readonly onDidChangeEmitter = new Emitter<EditorChangeEvent>();
  private selection: Selection;
  private preferredColumn: number | undefined;

  constructor(text = "") {
    this.model = new TextModel(text);
    this.selection = collapsedSelection({ line: 0, column: 0 });
  }

  onDidChange(listener: Listener<EditorChangeEvent>): Disposable {
    return this.onDidChangeEmitter.event(listener);
  }

  // El Patrone -> All User Events come here
  dispatch(action: EditorAction): void {
    switch (action.type) {
      case "insertText":
        this.applyTextEdit(action, action.text);
        break;
      case "insertNewLine":
        this.applyTextEdit(action, "\n");
        break;
      case "deleteLeft":
        this.deleteLeft(action);
        break;
      case "deleteRight":
        this.deleteRight(action);
        break;
      case "moveCursor":
        this.moveCursor(action);
        break;
      case "undo":
        this.restoreFromHistory(action);
        break;
      case "redo":
        this.restoreFromHistory(action);
        break;
    }
  }

  getText(): string {
    return this.model.getText();
  }

  getLines(): string[] {
    return this.model.getLines();
  }

  getSelection(): Selection {
    return cloneSelection(this.selection);
  }

  getCursor(): Position {
    return { ...this.selection.active };
  }

  private applyTextEdit(action: EditorAction, text: string): void {
    const range = this.getReplacementRange();
    this.commitEdit(action, range, text);
  }

  private deleteLeft(action: EditorAction): void {
    if (!isSelectionCollapsed(this.selection)) {
      this.commitEdit(action, selectionToRange(this.selection), "");
      return;
    }

    const cursor = this.selection.active;
    const start = this.model.positionLeft(cursor);
    if (comparePositions(start, cursor) === 0) {
      return;
    }

    this.commitEdit(action, { start, end: cursor }, "");
  }

  private deleteRight(action: EditorAction): void {
    if (!isSelectionCollapsed(this.selection)) {
      this.commitEdit(action, selectionToRange(this.selection), "");
      return;
    }

    const cursor = this.selection.active;
    const end = this.model.positionRight(cursor);
    if (comparePositions(end, cursor) === 0) {
      return;
    }

    this.commitEdit(action, { start: cursor, end }, "");
  }

  private moveCursor(action: MoveCursorAction): void {
    const previousSelection = this.getSelection();
    const active = this.selection.active;

    const preferredColumn =
      action.direction === "up" || action.direction === "down"
        ? (this.preferredColumn ?? active.column)
        : undefined;

    let next: Position;
    switch (action.direction) {
      case "left":
        next = this.model.positionLeft(active);
        break;
      case "right":
        next = this.model.positionRight(active);
        break;
      case "up":
        next = this.model.positionUp(active, preferredColumn);
        break;
      case "down":
        next = this.model.positionDown(active, preferredColumn);
        break;
    }

    // Selection stores both the fixed anchor and moving active end. Plain
    // arrows collapse the selection to the new cursor. Shift+arrows keep the
    // anchor where selection began and move only the active edge.
    this.selection = action.extendSelection
      ? { anchor: this.selection.anchor, active: next }
      : collapsedSelection(next);

    this.preferredColumn =
      action.direction === "up" || action.direction === "down"
        ? preferredColumn
        : undefined;

    this.emitChange({
      changes: [
        {
          type: "selectionChanged",
          current: this.getSelection(),
          previous: previousSelection
        }
      ]
    });
  }

  private commitEdit(action: EditorAction, range: Range, text: string): void {
    const before = this.createSnapshot();
    const result = this.model.applyEdit({ range, text });

    this.history.push(before);
    this.selection = collapsedSelection(result.endPosition);
    this.preferredColumn = undefined;

    const changes = buildTextChanges(before.lines, this.getLines());

    if (changes[0]?.type !== "documentReset") {
      changes.push({
        type: "selectionChanged",
        previous: before.selection,
        current: this.getSelection()
      });
    }

    this.emitChange({ changes });
  }

  private restoreFromHistory(action: EditorAction): void {
    const current = this.createSnapshot();
    const next =
      action.type === "undo"
        ? this.history.undo(current)
        : this.history.redo(current);

    if (!next) {
      return;
    }

    this.restoreSnapshot(next);
    this.emitChange({ changes: [{ type: "documentReset" }] });
  }

  private getReplacementRange(): Range {
    // Typing while a selection exists replaces exactly the selected range. This
    // keeps typing, Enter, Backspace, and Delete on one shared edit path.
    return isSelectionCollapsed(this.selection)
      ? { start: this.selection.active, end: this.selection.active }
      : selectionToRange(this.selection);
  }

  private createSnapshot(): EditorSnapshot {
    return {
      lines: this.model.getLines(),
      selection: cloneSelection(this.selection),
      preferredColumn: this.preferredColumn
    };
  }

  private restoreSnapshot(snapshot: EditorSnapshot): void {
    const copy = cloneSnapshot(snapshot);
    this.model.setLines(copy.lines);
    this.selection = copy.selection;
    this.preferredColumn = copy.preferredColumn;
  }

  private emitChange(event: EditorChangeEvent): void {
    this.onDidChangeEmitter.fire(event);
  }
}

function cloneSelection(selection: Selection): Selection {
  return {
    anchor: { ...selection.anchor },
    active: { ...selection.active }
  };
}

function buildTextChanges(
  previousLines: string[],
  currentLines: string[]
): EditorChange[] {
  if (previousLines.length !== currentLines.length) {
    return [{ type: "documentReset" }];
  }

  const changes: EditorChange[] = [];

  for (let index = 0; index < currentLines.length; index += 1) {
    if (previousLines[index] !== currentLines[index]) {
      changes.push({
        type: "lineChanged",
        lineIndex: index,
        previousText: previousLines[index],
        currentText: currentLines[index]
      });
    }
  }

  return changes;
}
