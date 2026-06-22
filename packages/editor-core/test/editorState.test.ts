import { describe, expect, it } from "vitest";
import { EditorState } from "../src";

describe("EditorState", () => {
  it("inserts text in the middle of a line", () => {
    const editor = new EditorState("Hello");

    moveRight(editor, 2);
    editor.dispatch({ type: "insertText", text: "y" });

    expect(editor.getText()).toBe("Heyllo");
    expect(editor.getCursor()).toEqual({ line: 0, column: 3 });
  });

  it("inserts multiline text", () => {
    const editor = new EditorState("Hello world");

    moveRight(editor, 5);
    editor.dispatch({ type: "insertText", text: "\nsmall\n" });

    expect(editor.getLines()).toEqual(["Hello", "small", " world"]);
    expect(editor.getCursor()).toEqual({ line: 2, column: 0 });
  });

  it("backspaces at a line boundary", () => {
    const editor = new EditorState("Hello\nworld");

    moveRight(editor, 5);
    moveRight(editor, 1);
    editor.dispatch({ type: "deleteLeft" });

    expect(editor.getText()).toBe("Helloworld");
    expect(editor.getCursor()).toEqual({ line: 0, column: 5 });
  });

  it("replaces a selection when typing", () => {
    const editor = new EditorState("Hello");

    moveRight(editor, 1);
    editor.dispatch({
      type: "moveCursor",
      direction: "right",
      extendSelection: true
    });
    editor.dispatch({
      type: "moveCursor",
      direction: "right",
      extendSelection: true
    });
    editor.dispatch({ type: "insertText", text: "a" });

    expect(editor.getText()).toBe("Halo");
    expect(editor.getCursor()).toEqual({ line: 0, column: 2 });
  });

  it("moves cursor across lines", () => {
    const editor = new EditorState("abc\nde\nfghi");

    moveRight(editor, 2);
    editor.dispatch({ type: "moveCursor", direction: "down" });
    editor.dispatch({ type: "moveCursor", direction: "down" });
    editor.dispatch({ type: "moveCursor", direction: "left" });
    editor.dispatch({ type: "moveCursor", direction: "up" });

    expect(editor.getCursor()).toEqual({ line: 1, column: 1 });
  });

  it("undoes and redoes edits", () => {
    const editor = new EditorState("Hello");

    moveRight(editor, 5);
    editor.dispatch({ type: "insertText", text: "!" });
    editor.dispatch({ type: "deleteLeft" });

    expect(editor.getText()).toBe("Hello");

    editor.dispatch({ type: "undo" });
    expect(editor.getText()).toBe("Hello!");

    editor.dispatch({ type: "undo" });
    expect(editor.getText()).toBe("Hello");

    editor.dispatch({ type: "redo" });
    expect(editor.getText()).toBe("Hello!");
  });
});

function moveRight(editor: EditorState, count: number): void {
  for (let index = 0; index < count; index += 1) {
    editor.dispatch({ type: "moveCursor", direction: "right" });
  }
}
