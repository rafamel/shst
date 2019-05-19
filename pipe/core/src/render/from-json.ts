import { IStructDef } from '~/types';

export default function renderFromJSON(arr: IStructDef[]): string {
  const overloads = arr
    .map((item) => {
      return `function fromJSON(plain: classes.I${item.is}): \
        classes.${item.is};`;
    })
    .join('\n');

  return `
    import * as classes from './struct';
    import { TType, TIType } from './interface';

    ${overloads}

    function fromJSON(plain: TIType): TType;
    function fromJSON(plain: TIType): TType {
      return (classes as any)[plain.type].fromJSON(plain);
    }
    export { fromJSON };
  `.trim();
}
