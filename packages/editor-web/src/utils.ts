export function focusScrollArea(scrollE: HTMLDivElement) {
  scrollE.focus();
}

export function queryEditorElements(app: Element) {
  const scrollArea = app.querySelector<HTMLDivElement>(".editor-scroll");
  const linesElement = app.querySelector<HTMLDivElement>(".editor-lines");
  const statusElement = app.querySelector<HTMLElement>(".status-bar");
  const inputCapture = app.querySelector<HTMLTextAreaElement>(".input-capture");

  return {
    scrollArea,
    linesElement,
    inputCapture,
    statusElement
  };
}
