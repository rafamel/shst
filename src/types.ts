import { SYMBOL } from '~/constants';

export type TLanguage = 'bash' | 'POSIX' | 'MirBSDKorn';

export interface IParserOpts {
  stopAt?: string;
  comments?: boolean;
  language?: TLanguage;
}

export interface INode {
  type: string;
  [key: string]: any;
  readonly [SYMBOL]: unique symbol;
}

export interface IFileNode extends INode {
  type: 'File';
}
