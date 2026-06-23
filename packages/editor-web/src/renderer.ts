import {
  type EditorChange,
  type EditorChangeEvent,
  type EditorState,
  type Position
} from "@learning-editor/editor-core";
import { EditorElements } from "./editor-elements";
import { LinesRenderer } from "./lines-renderer";

export class EditorRenderer {
  constructor(
    private readonly editor: EditorState,
    private readonly linesRenderer: LinesRenderer,
    private readonly statusElement: HTMLElement,
    private readonly elements: EditorElements
  ) {}

  render(event: EditorChangeEvent): void {
    console.info(event);
    if (event.changes.length === 0) {
      this.renderFullSync();
      return;
    }

    for (const change of event.changes) {
      this.renderChange(change);
    }
  }

  renderFullSync(): void {
    const lines = this.editor.getLines();
    const selection = this.editor.getSelection();
    const cursor = this.editor.getCursor();

    this.linesRenderer.render(lines, selection, cursor);
    this.renderFooterLine(cursor);
  }

  // Todo: perform the correct changes
  private renderChange(change: EditorChange): void {
    switch (change.type) {
      case "selectionChanged":
        this.renderFullSync();
        break;

      case "lineChanged":
        this.renderFullSync();
        break;

      case "linesInserted":
      case "linesRemoved":
      case "documentReset":
        this.renderFullSync();
        break;
    }
  }

  private renderFooterLine(cursor: Position) {
    const el = this.elements.updateFooterLine(cursor.line, cursor.column);
    this.statusElement.appendChild(el);
  }
}
