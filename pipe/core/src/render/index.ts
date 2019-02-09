import { ITypeDefMap, TTypeDef, IKindBox } from '~/types';
import collection from './collection';
import imports from './imports';

export function kindBox(arr: TTypeDef[]): IKindBox {
  return arr.reduce(
    (acc: IKindBox, item) => {
      switch (item.kind) {
        case 'enum':
          acc.enum.push(item);
          break;
        case 'interface':
          acc.interface.push(item);
          break;
        case 'struct':
          acc.struct.push(item);
          break;
        default:
          // eslint-disable-next-line no-console
          console.error(item);
          throw Error('Kind could not be identified');
      }
      return acc;
    },
    { enum: [], interface: [], struct: [] }
  );
}

export default function assemble(
  types: ITypeDefMap
): { [key: string]: string } {
  const boxed = kindBox(Object.values(types));
  const all = {
    enum: collection(boxed.enum),
    interface: collection(boxed.interface),
    struct: collection(boxed.struct)
  };

  return {
    index: `
      export * from './enum';
      export * from './interface';
      export * from './struct';
      export * from './types';
    `,
    enum: imports(all.enum.dependencies, 'enum') + all.enum.render,
    interface:
      imports(all.interface.dependencies, 'interface') + all.interface.render,
    struct:
      `/* eslint-disable @typescript-eslint/no-use-before-define */\n\n` +
      imports(all.struct.dependencies, 'struct') +
      all.struct.render,
    types: `
      export const interfaces: { [key:string]: string[] } = ${JSON.stringify(
        Object.values(types).reduce((acc: any, item) => {
          if (item.kind === 'interface') {
            acc[item.is] = item.implementedBy;
          }
          return acc;
        }, {}),
        null,
        2
      )};
      export const traversal: { [key:string]: string[] } = ${JSON.stringify(
        Object.values(types).reduce((acc: any, item) => {
          if (item.kind === 'struct') {
            // @ts-ignore
            const inodes = types.INode.implementedBy;
            acc[item.is] = item.fields
              .filter((field) => inodes.includes(field.value.type))
              .map((field) => field.is);
          }
          return acc;
        }, {}),
        null,
        2
      )}
    `
  };
}
