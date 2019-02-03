import { sh } from '~/lib';
import { SYMBOL, LANGUAGE_MAP } from '~/constants';
import { TLanguage, IParserOpts, IFileNode } from '~/types';
import toNode from '~/utils/to-node';

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

    this[SYMBOL] = syntax.NewParser(...args);
  }
  public parse(str: string): IFileNode {
    const rootNode = this[SYMBOL].Parse(str);
    // const type: string = rootNode.$type.replace(/^.*\.\*/, '');
    // make sure str is not undefined
    return toNode(rootNode);
  }
}
