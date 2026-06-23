import { Selection } from "./selection";

export interface EditorChangeEvent {
  changes: EditorChange[];
}

export type EditorChange =
  | SelectionChanged
  | LineChanged
  | LinesInserted
  | LinesRemoved
  | DocumentReset;

export interface SelectionChanged {
  type: "selectionChanged";
  previous: Selection;
  current: Selection;
}

export interface LineChanged {
  type: "lineChanged";
  lineIndex: number;
  previousText: string;
  currentText: string;
}

export interface LinesInserted {
  type: "linesInserted";
  startLine: number;
  lines: string[];
}

export interface LinesRemoved {
  type: "linesRemoved";
  startLine: number;
  lines: string[];
}

export interface DocumentReset {
  type: "documentReset";
}
