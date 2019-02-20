import { IStructDef } from '~/types';

export default function fromJSON(arr: IStructDef[]): string {
  const overloads = arr
    .map((item) => {
      return `function fromJSON(plain: classes.T${item.is}): \
        classes.${item.is};`;
    })
    .join('\n');

  return `
    import * as classes from './struct';

    ${overloads}

    function fromJSON(plain: any): any {
      return (classes as any)[plain.type].fromJSON(plain);
    }
    export { fromJSON };
  `.trim();
}
