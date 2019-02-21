import sh from '#/sh';
import { LANGUAGE_MAP } from '~/constants';
import { TLanguage, IParserOpts } from '~/types';
import { File } from '#/core';
import { seed, collect, call, internal } from '#/core/util';
import * as externalize from '#/core/externalize';

/**
 * Allows configuration of parsing options applied when parsing shell scripts.
 */
export default class Parser {
  public stopAt: string | null;
  public comments: boolean;
  public language: TLanguage;
  public constructor({ stopAt, comments, language }: IParserOpts = {}) {
    const args: any = [];

    // stopAt
    if (stopAt) args.push(sh.syntax.stopAt(stopAt));
    this.stopAt = stopAt || null;

    // comments
    if (comments) args.push(sh.syntax.KeepComments);
    this.comments = comments || false;

    const lang: { self: TLanguage; sh: string } =
      // @ts-ignore
      (language && LANGUAGE_MAP[language.toLowerCase()]) || LANGUAGE_MAP.bash;
    this.language = lang.self;
    args.push(sh.syntax.Variant(sh.syntax[lang.sh]));

    seed(this, call(() => sh.syntax.NewParser(...args)));
  }
  /**
   * Parses a shell script.
   */
  public parse(str: string, name?: string): File {
    return externalize.type(internal.get(collect(this).Parse(str, name)));
  }
}
