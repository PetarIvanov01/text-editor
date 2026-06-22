import { EditorState } from "@learning-editor/editor-core";
import { actionFromKeyboardEvent } from "./keyboard";
import { EditorRenderer } from "./renderer";
import "./styles.css";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Missing #app element");
}

app.innerHTML = `
  <main class="shell">
    <header class="toolbar">
      <button class="toolbar-button" type="button" data-command="undo">Undo</button>
      <button class="toolbar-button" type="button" data-command="redo">Redo</button>
    </header>
    <section class="editor-frame" aria-label="Text editor">
      <div class="editor-scroll" tabindex="0">
        <div class="editor-lines"></div>
      </div>
      <textarea class="input-capture" aria-hidden="true" tabindex="-1"></textarea>
    </section>
    <footer class="status-bar"></footer>
  </main>
`;

const editor = new EditorState(
  "Hello editor\n\nThis project keeps the core separate from the browser."
);
const scrollArea = app.querySelector<HTMLDivElement>(".editor-scroll");
const linesElement = app.querySelector<HTMLDivElement>(".editor-lines");
const statusElement = app.querySelector<HTMLElement>(".status-bar");
const inputCapture = app.querySelector<HTMLTextAreaElement>(".input-capture");

if (!scrollArea || !linesElement || !statusElement || !inputCapture) {
  throw new Error("Editor DOM was not created correctly");
}

const renderer = new EditorRenderer(editor, linesElement, statusElement);
editor.onDidChange(() => renderer.render());
renderer.render();

scrollArea.addEventListener("keydown", (event) => {
  const action = actionFromKeyboardEvent(event);
  if (!action) {
    return;
  }

  event.preventDefault();
  editor.dispatch(action);
});

scrollArea.addEventListener("pointerdown", () => {
  scrollArea.focus();
});

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
  scrollArea.focus();
});

scrollArea.focus();
