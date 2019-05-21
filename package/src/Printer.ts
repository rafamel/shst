import core, { File } from '@shst/core';
import sh from '~/sh';
import { IPrinterOpts } from '~/types';

/**
 * Allows configuration of stringification options applied when printing.
 */
export default class Printer {
  public constructor(opts: IPrinterOpts = {}) {
    const {
      minify,
      padding,
      switchCaseIndent,
      binaryNextLine,
      spaceRedirects
    } = opts;

    Object.defineProperties(this, {
      minify: { writable: false, value: minify || false },
      padding: { writable: false, value: padding || false },
      switchCaseIndent: { writable: false, value: switchCaseIndent || false },
      binaryNextLine: { writable: false, value: binaryNextLine || false },
      spaceRedirects: { writable: false, value: spaceRedirects || false }
    });

    const args: any[] = [];
    if (minify) args.push(sh.syntax.Minify);
    if (padding) args.push(sh.syntax.KeepPadding);
    if (switchCaseIndent) args.push(sh.syntax.SwitchCaseIndent);
    if (binaryNextLine) args.push(sh.syntax.BinaryNextLine);
    if (spaceRedirects) args.push(sh.syntax.SpaceRedirects);

    core.seed(this, core.call(() => sh.syntax.NewPrinter()));
  }
  /**
   * Prints a parsed tree.
   */
  public print(node: File): string {
    return core.call(() =>
      core.collect(this).Print(core.collect(node).external)
    );
  }
}
