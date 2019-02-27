import { ITypeDefMap, TTypeDef } from '~/types';

export default function docMap(
  doc: string,
  type: TTypeDef,
  types: ITypeDefMap
): string {
  let str = doc
    .replace(/\n/g, ' ')
    .replace(/ +/g, ' ')
    .replace(/\*/g, '')
    .replace(/ $/, '')
    .replace(/^ /, '')
    .replace(/LangBash/g, 'bash language')
    .replace(/LangPOSIX/g, 'POSIX language')
    .replace(/LangMirBSDKorn/g, 'MirBSDKorn language');

  Object.values(types).forEach((type) => {
    str = str.replace(new RegExp(type.was, 'g'), type.is);
  });

  if (type.kind === 'struct') {
    type.fields.forEach((field) => {
      str = str.replace(new RegExp(field.was, 'g'), field.is);
    });
  }
  if (type.kind === 'struct' || type.kind === 'interface') {
    type.methods.forEach((method) => {
      str = str.replace(new RegExp(method.was, 'g'), method.is);
    });
  }

  return str;
}
