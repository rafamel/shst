import {
  ITypeDef,
  IEnumDef,
  IStructDef,
  IInterfaceDef,
  IFieldDef,
  IMethodDef
} from '../types';
import assert from 'assert';
import { valueType, dumpDoc } from './helpers';

export default function assemble(arr: ITypeDef[]): string {
  return (
    `
    import RootModel from '~/RootModel';
    import { SYMBOL } from '~/constants';
    ` +
    arr
      .map((item: any) => {
        switch (item.kind) {
          case 'enum':
            return assembleEnum(item);
          case 'struct':
            return assembleStruct(item);
          case 'interface':
            return assembleInterface(item);
          default:
            break;
        }

        // eslint-disable-next-line no-console
        console.error(item);
        throw Error('Item kind was not recognizable for assemble');
      })
      .join('\n\n')
  );
}

export function assembleEnum(obj: IEnumDef): string {
  assert(obj.kind === 'enum');

  // TODO build enumerations with indexes (for typedoc)
  return (
    dumpDoc(obj.doc) +
    `export enum ${obj.is} { ${obj.values.join(', ')} }`.trim()
  );
}

export function assembleStruct(obj: IStructDef): string {
  assert(obj.kind === 'struct');

  const fields = obj.fields
    .map(
      (field: IFieldDef): string => {
        return (
          dumpDoc(field.doc) +
          `
            public get ${field.is}(): ${valueType(field.value)} {
              return this[SYMBOL]["${field.was}"];
            }
            public set ${field.is}(val: ${valueType(field.value)}) {
              this[SYMBOL]["${field.was}"] = val;
            }
          `.trim()
        );
      }
    )
    .join('');

  const methods = obj.methods
    .map(
      (method: IMethodDef): string => {
        const params = method.params
          .map((param): string => `${param.name}: ${valueType(param.value)}`)
          .join(', ');
        return (
          dumpDoc(method.doc) +
          `
            public ${method.is}(${params}): ${valueType(method.returns)} {
              return this[SYMBOL]["${method.was}"](
                ${method.params.map((x) => x.name).join(', ')}
              );
            }
          `.trim()
        );
      }
    )
    .join('');
  // classes should implement interfaces
  const implement = obj.implements.length
    ? 'implements ' + obj.implements.join(', ')
    : '';

  return `
    export class ${obj.is} extends RootModel ${implement} {
      ${fields}
      ${methods}
    }
  `;
}

export function assembleInterface(obj: IInterfaceDef): string {
  assert(obj.kind === 'interface');

  const methods = obj.methods
    .map(
      (method: IMethodDef): string => {
        const params = method.params
          .map((param): string => `${param.name}: ${valueType(param.value)}`)
          .join(', ');
        return (
          dumpDoc(method.doc) +
          `${method.is}(${params}): ${valueType(method.returns)};`
        );
      }
    )
    .join('\n');

  return (
    dumpDoc(obj.doc) +
    `
    export interface ${obj.is} {
      ${methods}
    }
  `.trim()
  );
}
