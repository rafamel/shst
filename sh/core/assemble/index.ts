import { ITypeDefMap, TTypeDef, IKindBox } from '../types';
import { collection, imports } from './render';

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
    `,
    enum: imports(all.enum.dependencies, 'enum') + all.enum.render,
    interface:
      imports(all.interface.dependencies, 'interface') + all.interface.render,
    struct: imports(all.struct.dependencies, 'struct') + all.struct.render
  };
}
