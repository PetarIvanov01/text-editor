export type Disposable = () => void;
export type Listener<TEvent> = (event: TEvent) => void;

export class Emitter<TEvent> {
  private readonly listeners = new Set<Listener<TEvent>>();

  event(listener: Listener<TEvent>): Disposable {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  fire(event: TEvent): void {
    for (const listener of [...this.listeners]) {
      listener(event);
    }
  }
}
