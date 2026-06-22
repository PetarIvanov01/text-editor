import type { EditorAction } from "@learning-editor/editor-core";

export function actionFromKeyboardEvent(
  event: KeyboardEvent
): EditorAction | undefined {
  const isShortcut = event.ctrlKey || event.metaKey;

  if (isShortcut && event.key.toLowerCase() === "z") {
    return event.shiftKey ? { type: "redo" } : { type: "undo" };
  }

  if (isShortcut && event.key.toLowerCase() === "y") {
    return { type: "redo" };
  }

  if (isShortcut || event.altKey) {
    return undefined;
  }

  switch (event.key) {
    case "Backspace":
      return { type: "deleteLeft" };
    case "Delete":
      return { type: "deleteRight" };
    case "Enter":
      return { type: "insertNewLine" };
    case "ArrowLeft":
      return {
        type: "moveCursor",
        direction: "left",
        extendSelection: event.shiftKey
      };
    case "ArrowRight":
      return {
        type: "moveCursor",
        direction: "right",
        extendSelection: event.shiftKey
      };
    case "ArrowUp":
      return {
        type: "moveCursor",
        direction: "up",
        extendSelection: event.shiftKey
      };
    case "ArrowDown":
      return {
        type: "moveCursor",
        direction: "down",
        extendSelection: event.shiftKey
      };
    default:
      if (event.key.length === 1) {
        return { type: "insertText", text: event.key };
      }

      return undefined;
  }
}
