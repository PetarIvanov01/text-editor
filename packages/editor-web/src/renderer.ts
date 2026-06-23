import {
  type EditorChange,
  type EditorChangeEvent,
  type EditorState,
  type Position
} from "@learning-editor/editor-core";
import { type EditorElements } from "./editor-elements";
import { type LinesRenderer } from "./lines-renderer";

export class EditorRenderer {
  constructor(
    private readonly editor: EditorState,
    private readonly linesRenderer: LinesRenderer,
    private readonly statusElement: HTMLElement,
    private readonly elements: EditorElements
  ) {}

  render(event: EditorChangeEvent): void {
    if (event.changes.length === 0) {
      this.renderFullSync();
      return;
    }

    for (const change of event.changes) {
      this.renderChange(change);
    }
  }

  private renderFullSync(): void {
    const lines = this.editor.getLines();
    const selection = this.editor.getSelection();
    const cursor = this.editor.getCursor();

    this.linesRenderer.sync(lines, selection);
    this.renderFooterLine(cursor);
  }

  private renderChange(change: EditorChange): void {
    switch (change.type) {
      case "selectionChanged":
        this.linesRenderer.updateSelection(change.previous, change.current);
        this.renderFooterLine(change.current.active);
        break;

      case "lineChanged":
        this.linesRenderer.updateLine(change.lineIndex, change.currentText);
        break;

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
