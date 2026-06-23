import { Selection } from "./selection";

export interface EditorChangeEvent {
  changes: EditorChange[];
}

export type EditorChange = SelectionChanged | LineChanged | DocumentReset;

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

export interface DocumentReset {
  type: "documentReset";
}
