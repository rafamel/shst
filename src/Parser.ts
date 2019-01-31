import core from '~/core';
import { SYMBOL, LANGUAGE_MAP } from '~/constants';
import { TLanguage, IParserOpts, IFileNode } from '~/types';
import toNode from '~/utils/to-node';

export default class Parser {
  private [SYMBOL]: any;
  public stopAt: string | null;
  public comments: boolean;
  public language: TLanguage;
  public constructor({ stopAt, comments, language }: IParserOpts = {}) {
    const args = [];

    // stopAt
    if (stopAt) args.push(core.stopAt(stopAt));
    this.stopAt = stopAt || null;

    // comments
    if (comments) args.push(core.KeepComments);
    this.comments = comments || false;

    const lang: { self: TLanguage; sh: string } =
      // @ts-ignore
      (language && LANGUAGE_MAP[language.toLowerCase()]) || LANGUAGE_MAP.bash;
    this.language = lang.self;
    args.push(core.Variant(core[lang.sh]));

    this[SYMBOL] = core.NewParser(...args);
  }
  public parse(str: string): IFileNode {
    return toNode(this[SYMBOL].Parse(str));
  }
}
