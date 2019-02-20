import { ITypeDefMap, TTypeDef, IKindBox } from '~/types';
import renderEnum from './enum';
import renderInterface from './interface';
import renderImplementation from './struct/implementation';
import renderDeclaration from './struct/declaration';
import renderPrototypes from './struct/prototypes';
import renderFromJSON from './from-json';
import { path } from '~/pkg';

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

  return {
    'enum.ts': renderEnum(boxed.enum),
    'interface.ts': renderInterface(boxed.interface),
    'struct.js': renderImplementation(boxed.struct),
    'struct.d.ts': renderDeclaration(boxed.struct),
    'prototypes.ts': renderPrototypes(boxed.struct),
    'from-json.ts': renderFromJSON(boxed.struct),
    'pkg.ts': `
      import sh from '#/sh';
      export const pkg = sh.packages['${path}'];
    `,
    'types.ts': `
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
    `
  };
}
