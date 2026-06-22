import type { Range } from "./range";

export interface TextEdit {
  range: Range;
  text: string;
}
