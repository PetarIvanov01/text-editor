export type CursorDirection = "left" | "right" | "up" | "down";

export type EditorAction =
  | { type: "insertText"; text: string }
  | { type: "deleteLeft" }
  | { type: "deleteRight" }
  | { type: "insertNewLine" }
  | {
      type: "moveCursor";
      direction: CursorDirection;
      extendSelection?: boolean;
    }
  | { type: "undo" }
  | { type: "redo" };
