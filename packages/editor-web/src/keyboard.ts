import type { CursorDirection, EditorAction } from "@learning-editor/editor-core";

const editKeyActions: Record<string, EditorAction> = {
  Backspace: { type: "deleteLeft" },
  Delete: { type: "deleteRight" },
  Enter: { type: "insertNewLine" }
};

const cursorDirections: Record<string, CursorDirection> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down"
};

const shortcutActions: Record<string, EditorAction> = {
  Backspace: { type: "deleteTokenLeft" },
  Delete: { type: "deleteTokenRight" },
  Y: { type: "redo" },
  Z: { type: "undo" },
  "Shift+Z": { type: "redo" }
};

export function actionFromKeyboardEvent(
  event: KeyboardEvent
): EditorAction | undefined {
  const isShortcut = event.ctrlKey || event.metaKey;

  if (isShortcut) {
    return handleShortcut(event);
  }

  const editAction = editKeyActions[event.key];
  if (editAction) {
    return editAction;
  }

  const direction = cursorDirections[event.key];
  if (direction) {
    return {
      type: "moveCursor",
      direction,
      extendSelection: event.shiftKey
    };
  }

  if (event.key.length === 1) {
    return { type: "insertText", text: event.key };
  }

  return undefined;
}

function handleShortcut(event: KeyboardEvent): EditorAction | undefined {
  if (event.altKey) {
    return undefined;
  }

  const key = event.key.length === 1 ? event.key.toUpperCase() : event.key;
  const shortcutKey = event.shiftKey ? `Shift+${key}` : key;
  return shortcutActions[shortcutKey];
}
