import sh from '#/sh';
import { File } from '#/core';
import { seed, collect, call } from '#/core/util';

/**
 * Allows configuration of stringification options applied when printing.
 */
export default class Printer {
  public constructor() {
    seed(this, call(() => sh.syntax.NewPrinter()));
  }
  /**
   * Prints a parsed tree.
   */
  public print(node: File): string {
    return call(() => collect(this).Print(collect(node).external));
  }
}
