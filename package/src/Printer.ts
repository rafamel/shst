import sh from '#/sh';
import { File } from '#/core';
import { wrap, unwrap, call, unwrapType } from './utils';

export default class Printer {
  public constructor() {
    wrap(this, call(() => sh.syntax.NewPrinter()));
  }
  public print(node: File): string {
    return call(() => unwrap(this).Print(unwrapType(node)));
  }
}
