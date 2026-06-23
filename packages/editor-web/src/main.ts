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

app.innerHTML = `
 <main class="shell">
      <header class="toolbar">
        <button class="toolbar-button" type="button" data-command="help">Help</button>
      </header>
      <section class="editor-frame" aria-label="Text editor">
        <div class="editor-scroll" tabindex="0">
          <div class="editor-lines"></div>
        </div>
        <textarea id="textarea" class="input-capture" aria-hidden="true" tabindex="-1"></textarea>
      </section>
      <footer class="status-bar"></footer>
    </main>
    <dialog class="keyboard-dialog" aria-labelledby="keyboard-dialog-title">
      <div class="keyboard-dialog-header">
        <h2 id="keyboard-dialog-title">Keyboard Commands</h2>
        <form method="dialog">
          <button class="dialog-close" type="submit" aria-label="Close">x</button>
        </form>
      </div>
      <dl class="keyboard-command-list">
        <div>
          <dt>Type character</dt>
          <dd>Insert text</dd>
        </div>
        <div>
          <dt>Enter</dt>
          <dd>Insert new line</dd>
        </div>
        <div>
          <dt>Backspace</dt>
          <dd>Delete left</dd>
        </div>
        <div>
          <dt>Delete</dt>
          <dd>Delete right</dd>
        </div>
        <div>
          <dt>Arrow keys</dt>
          <dd>Move cursor</dd>
        </div>
        <div>
          <dt>Shift + Arrow keys</dt>
          <dd>Extend selection</dd>
        </div>
        <div>
          <dt>Ctrl/Cmd + Z</dt>
          <dd>Undo</dd>
        </div>
        <div>
          <dt>Ctrl/Cmd + Shift + Z</dt>
          <dd>Redo</dd>
        </div>
        <div>
          <dt>Ctrl/Cmd + Y</dt>
          <dd>Redo</dd>
        </div>
      </dl>
    </dialog>
`;

const { inputCapture, linesElement, scrollArea, statusElement } =
  queryEditorElements(app);

if (!scrollArea || !linesElement || !statusElement || !inputCapture) {
  throw new Error("Editor DOM was not created correctly");
}

const { editor } = initEditorTracking(linesElement, statusElement);

attachToolbarHandlers(app, scrollArea);
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

function attachToolbarHandlers(app: Element, scrollArea: HTMLDivElement) {
  const keyboardDialog =
    app.querySelector<HTMLDialogElement>(".keyboard-dialog");

  keyboardDialog?.addEventListener("close", () => {
    focusScrollArea(scrollArea);
  });

  app.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
      "button[data-command]"
    );
    if (!button) {
      return;
    }

    const command = button.dataset.command;
    if (command === "help") {
      keyboardDialog?.showModal();
      return;
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
