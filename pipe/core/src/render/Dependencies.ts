import { IValue } from '~/types';
import assert from 'assert';

export interface IDependencyMap {
  [key: string]: string[];
}

export default class Dependencies {
  private dependsOn: IDependencyMap;
  public constructor() {
    this.dependsOn = {};
  }
  public add(item: IValue): void {
    assert(typeof item === 'object');

    return this.addCustom(item.type, item.kind);
  }
  public addCustom(name: string, kind: string): void {
    assert(typeof name === 'string');
    assert(typeof kind === 'string');

    if (!this.dependsOn.hasOwnProperty(kind)) {
      this.dependsOn[kind] = [];
    }
    this.dependsOn[kind].push(name);
  }
  public get(kind: string): string[] {
    assert(this.dependsOn.hasOwnProperty(kind));

    this.dependsOn[kind] = this.dependsOn[kind].filter(
      (x, i, arr) => arr.indexOf(x) === i
    );
    return this.dependsOn[kind];
  }
  public getAll(): IDependencyMap {
    return Object.keys(this.dependsOn).reduce(
      (acc: IDependencyMap, key: string) => {
        acc[key] = this.get(key);
        return acc;
      },
      {}
    );
  }
  public kinds(): string[] {
    return Object.keys(this.dependsOn);
  }
}
