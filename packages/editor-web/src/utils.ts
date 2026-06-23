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

export function randomId() {
  // Source - https://stackoverflow.com/a/46555314
  // Posted by Jules Goullee
  // Retrieved 2026-06-23, License - CC BY-SA 3.0
  var array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return array[0];
}
