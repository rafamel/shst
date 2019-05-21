export interface ISh {
  syntax: any;
  packages: any;
  path: string;
  package: any;
}

let stored: ISh;
const queue: Array<() => void> = [];

export function provide(sh: ISh): void {
  stored = sh;

  while (queue.length) {
    (queue.shift() as typeof queue[0])();
  }
}

export function retrieve(): ISh {
  if (!stored) throw Error(`Core hasn't been provided with syntax module`);
  return stored;
}

export function enqueue(fn: () => void): void {
  if (stored) fn();
  else queue.push(fn);
}
