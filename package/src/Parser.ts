import sh from '@shast/sh';
import { SYMBOL, LANGUAGE_MAP } from '~/constants';
import { TLanguage, IParserOpts } from '~/types';
import { File } from '@shast/core';

const { syntax } = sh;
export default class Parser {
  private [SYMBOL]: any;
  public stopAt: string | null;
  public comments: boolean;
  public language: TLanguage;
  public constructor({ stopAt, comments, language }: IParserOpts = {}) {
    const args = [];

    // stopAt
    if (stopAt) args.push(syntax.stopAt(stopAt));
    this.stopAt = stopAt || null;

    // comments
    if (comments) args.push(syntax.KeepComments);
    this.comments = comments || false;

    const lang: { self: TLanguage; sh: string } =
      // @ts-ignore
      (language && LANGUAGE_MAP[language.toLowerCase()]) || LANGUAGE_MAP.bash;
    this.language = lang.self;
    args.push(syntax.Variant(syntax[lang.sh]));

    Object.defineProperty(this, SYMBOL, {
      enumerable: false,
      value: syntax.NewParser(...args)
    });
  }
  public parse(str: string): File {
    const rootNode = this[SYMBOL].Parse(str);
    return Object.create(File.prototype, {
      [SYMBOL]: {
        enumerable: false,
        value: rootNode
      }
    });
  }
}
