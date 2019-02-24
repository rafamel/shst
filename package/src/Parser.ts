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
  public readonly stopAt: string | null;
  public readonly comments: boolean;
  public readonly language: TLanguage;
  public constructor({ stopAt, comments, language }: IParserOpts = {}) {
    const lang: { self: TLanguage; sh: string } =
      (language && (LANGUAGE_MAP as any)[language.toLowerCase()]) ||
      LANGUAGE_MAP.bash;

    Object.defineProperties(this, {
      stopAt: { writable: false, value: stopAt || null },
      comments: { writable: false, value: comments || false },
      language: { writable: false, value: lang.self }
    });

    const args: any = [];
    if (stopAt) args.push(sh.syntax.stopAt(stopAt));
    if (comments) args.push(sh.syntax.KeepComments);
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
