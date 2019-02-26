export type TLanguage = 'bash' | 'POSIX' | 'MirBSDKorn';

export interface IParserOpts {
  /**
   * Stops parsing at an arbitrary word, as if it were the end of the input. If can contain any characters except whitespaces. It will only apply when following whitespace or a separating token. `"$$"` will act on the inputs `"foo $$"` and `"foo;$$"`, but not on `"foo '$$'"`.
   */
  stopAt?: string;
  /**
   * A *boolean* indicating whether to parse comments.
   */
  comments?: boolean;
  /**
   * Sets the language variant a parser should use.
   */
  language?: TLanguage;
}
