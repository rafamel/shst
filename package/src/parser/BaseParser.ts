import sh from '#/sh';
import { LANGUAGE_MAP } from '~/constants';
import { TLanguage, IParserOpts } from '~/types';
import { seed, call } from '#/core/util';

/**
 * Abstract parser class
 */
export default class BaseParser {
  /**
   * Contains the `stopAt` option passed to the constructor. `null` by default.
   */
  public readonly stopAt: string | null;
  /**
   * Contains the `comments` option passed to the constructor. `false` by default.
   */
  public readonly comments: boolean;
  /**
   * Contains the `language` option passed to the constructor. `"bash"` by default.
   */
  public readonly language: TLanguage;
  public constructor(opts: IParserOpts = {}) {
    const { stopAt, comments, language } = opts;
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
}
