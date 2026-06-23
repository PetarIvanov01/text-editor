import { randomId } from "./utils";

export class EditorElements {
  private footerLine: HTMLDivElement;

  constructor() {
    this.footerLine = document.createElement("div");
  }

  // This active state won't work that way with the optimized version
  // Right now it works because I am re-creating all of the lines on each change
  // However this is not correct.
  // Rather, I have to track the cursor movement and update the row meta
  createRow(isActive: boolean) {
    const row = document.createElement("div");
    row.className = `editor-row ${isActive ? "selected" : ""}`;
    row.dataset.id = String(randomId());
    return row;
  }

  createGutter(lineIndex: number) {
    const gutter = document.createElement("div");
    gutter.className = "editor-gutter";
    gutter.textContent = String(lineIndex + 1);
    return gutter;
  }

  createText() {
    const text = document.createElement("div");
    text.className = "editor-text";
    return text;
  }

  updateFooterLine(line = 0, column = 0) {
    this.footerLine.textContent = `Line ${line + 1}, Column ${column + 1}`;
    return this.footerLine;
  }
}
