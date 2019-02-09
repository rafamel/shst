export type TLanguage = 'bash' | 'POSIX' | 'MirBSDKorn';

export interface IParserOpts {
  stopAt?: string;
  comments?: boolean;
  language?: TLanguage;
}
