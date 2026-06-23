import { EditorState } from "@learning-editor/editor-core";

import { EditorRenderer } from "./renderer";
import { focusScrollArea, queryEditorElements } from "./utils";
import { actionFromKeyboardEvent } from "./keyboard";
import "./styles.css";
import { EditorElements } from "./editor-elements";
import { LinesRenderer } from "./lines-renderer";

const app = document.querySelector("#app");

if (!app) {
  throw new Error("Missing #app element");
}

const { inputCapture, linesElement, scrollArea, statusElement } =
  queryEditorElements(app);

if (!scrollArea || !linesElement || !statusElement || !inputCapture) {
  throw new Error("Editor DOM was not created correctly");
}

const { editor } = initEditorTracking(linesElement, statusElement);

attachControllerButtonsHandlers(app, scrollArea);
attachScrollAreaEventHandlers(scrollArea);

focusScrollArea(scrollArea);

/* -- Initialized -- */

function attachScrollAreaEventHandlers(scrollE: HTMLDivElement) {
  scrollE.addEventListener("keydown", (event) => {
    const action = actionFromKeyboardEvent(event);
    if (!action) {
      return;
    }

    event.preventDefault();
    editor.dispatch(action);
  });

  scrollE.addEventListener("pointerdown", () => {
    scrollE.focus();
  });

  scrollE.addEventListener("blur", () => {
    // scrollE.classList.add("not-focused");
  });

  scrollE.addEventListener("focus", () => {
    scrollE.classList.remove("not-focused");
  });
}

function attachControllerButtonsHandlers(
  app: Element,
  scrollArea: HTMLDivElement
) {
  app.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
      "button[data-command]"
    );
    if (!button) {
      return;
    }

    const command = button.dataset.command;
    if (command === "undo") {
      editor.dispatch({ type: "undo" });
    }
    if (command === "redo") {
      editor.dispatch({ type: "redo" });
    }
    focusScrollArea(scrollArea);
  });
}

function initEditorTracking(
  linesElement: HTMLDivElement,
  statusElement: HTMLElement
) {
  const editor = new EditorState();
  const editorElements = new EditorElements();
  const linesRenderer = new LinesRenderer(linesElement, editorElements);
  const editorRenderer = new EditorRenderer(
    editor,
    linesRenderer,
    statusElement,
    editorElements
  );

  editor.onDidChange((event) => editorRenderer.render(event));
  editorRenderer.render({ changes: [] });

  return { editor };
}
