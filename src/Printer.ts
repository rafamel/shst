import core from '~/core';
import { SYMBOL } from '~/constants';
import { IFileNode } from '~/types';

export default class Printer {
  private [SYMBOL]: any;
  public constructor() {
    this[SYMBOL] = core.NewPrinter();
  }
  public print(node: IFileNode): string {
    return this[SYMBOL].Print(node[SYMBOL]);
  }
}
