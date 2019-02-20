import sh from '#/sh';
import { File } from '#/core';
import { seed, collect, call } from '#/core/util';

export default class Printer {
  public constructor() {
    seed(this, call(() => sh.syntax.NewPrinter()));
  }
  public print(node: File): string {
    return call(() => collect(this).Print(collect(node).external));
  }
}
