import sh from '@shast/sh';
import { LANGUAGE_MAP } from '~/constants';
import { TLanguage, IParserOpts } from '~/types';
import { File } from '@shast/core';
import { wrap, unwrap, call, wrapType } from './utils';

const { syntax } = sh;
export default class Parser {
  public stopAt: string | null;
  public comments: boolean;
  public language: TLanguage;
  public constructor({ stopAt, comments, language }: IParserOpts = {}) {
    const args: any = [];

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

    wrap(this, call(() => syntax.NewParser(...args)));
  }
  public parse(str: string): File {
    const rootNode = unwrap(this).Parse(str);
    return wrapType(File, rootNode);
  }
}
