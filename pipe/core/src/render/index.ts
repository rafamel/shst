import { ITypeDefMap, TTypeDef, IKindBox } from '~/types';
import collection from './collection';
import imports from './imports';
import map from './map.json';

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
      import * as types from './types';
      
      export default types;
      export * from './enum';
      export * from './interface';
      export * from './struct';
    `,
    enum: imports(all.enum.dependencies, 'enum') + all.enum.render,
    interface:
      imports(all.interface.dependencies, 'interface') + all.interface.render,
    struct:
      `/* eslint-disable @typescript-eslint/no-use-before-define */\n\n` +
      imports(all.struct.dependencies, 'struct') +
      all.struct.render,
    types: `
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
      export const structs: { [key:string]: string } = ${JSON.stringify(
        Object.values(types).reduce((acc: any, item) => {
          if (item.kind === 'struct') {
            acc[item.was] = item.is;
          }
          return acc;
        }, {}),
        null,
        2
      )}
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
    `,
    helpers: `
      import { interfaces, structs } from './types';
      import * as classes from './struct';
      import { getType, wrapType, wrapList } from '${map.util}';

      export function interfaced(name: string, instance: any): boolean {
        const type = instance.constructor && instance.constructor.type;
        if (!type) return false;
        const arr: string[] | void = interfaces[name];
        return !!arr && arr.includes(type);
      }
      export function resolveInterface(item: any): any {
        const type = getType(item);
        // @ts-ignore
        return type ? wrapType(classes[structs[type]], item) : item;
      }
      export function resolveInterfaceList(arr: any[]): any {
        return wrapList(arr.map(resolveInterface));
      }
      `
  };
}
