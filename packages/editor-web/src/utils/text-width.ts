type GetTextWidth = {
  (text: string, font: string): number;
  canvas?: HTMLCanvasElement;
};

// stack overflow - https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript
export const getTextWidth: GetTextWidth = (text, font): number => {
  // re-use canvas object for better performance
  const canvas = (getTextWidth.canvas ??= document.createElement("canvas"));
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not get 2D canvas context");
  }
  context.font = font;
  const metrics = context.measureText(text);
  return metrics.width;
};

export function getCanvasFont(el = document.body) {
  const fontWeight = getCssStyle(el, "font-weight") || "normal";
  const fontSize = getCssStyle(el, "font-size") || "16px";
  const fontFamily = getCssStyle(el, "font-family") || "Times New Roman";

  return `${fontWeight} ${fontSize} ${fontFamily}`;
}

function getCssStyle(element: HTMLElement, prop: string) {
  return window.getComputedStyle(element, null).getPropertyValue(prop);
}
