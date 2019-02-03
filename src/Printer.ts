import { sh } from '~/lib';
import { SYMBOL } from '~/constants';
import { IFileNode } from '~/types';

export default class Printer {
  private [SYMBOL]: any;
  public constructor() {
    this[SYMBOL] = sh.syntax.NewPrinter();
  }
  public print(node: IFileNode): string {
    return this[SYMBOL].Print(node[SYMBOL]);
  }
}
