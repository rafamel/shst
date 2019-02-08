import { SYMBOL } from '~/constants';

export type TLanguage = 'bash' | 'POSIX' | 'MirBSDKorn';

export interface IParserOpts {
  stopAt?: string;
  comments?: boolean;
  language?: TLanguage;
}

export interface IFileNode {
  type: 'File';
  [key: string]: any;
  readonly [SYMBOL]: unique symbol;
}
