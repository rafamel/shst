import { IInterfaceDef, IMethodDef } from '~/types';
import assert from 'assert';
import { renderType, renderDoc, renderParams } from './helpers';
import Dependencies from './Dependencies';
import imports from './imports';

export default function renderInterface(arr: IInterfaceDef[]): string {
  assert(!arr.map((x) => x.is).includes('IType'));

  const dependencies = new Dependencies();
  const str = arr.map((item) => each(item, dependencies)).join('\n');

  return (
    '/* eslint-disable import/named */\n' +
    imports(dependencies, 'interface') +
    renderDoc(
      `Determines whether a given instance is of a class that implements \`IType\``
    ) +
    `
      export function isType(instance: any): boolean {
        return isInterface('IType', instance);
      }
      export interface IType {
        type: string;
      }
    `.trim() +
    str
  );
}

export function each(obj: IInterfaceDef, dependencies: Dependencies): string {
  assert(obj.kind === 'interface');

  const methods = obj.methods
    .map(
      (method: IMethodDef): string => {
        dependencies.add(method.returns);

        const params = renderParams(method.params, dependencies);

        return (
          renderDoc(method.doc) +
          `${method.is}(${params}): ${renderType(
            method.returns,
            dependencies
          )};`
        );
      }
    )
    .join('\n');

  dependencies.addCustom('isInterface', 'util');
  return (
    renderDoc(obj.doc) +
    `
      export interface ${obj.is} extends IType {
        ${methods}
      }
    `.trim() +
    renderDoc(`Any \`${obj.is}\` implementation as a plain object`) +
    `
      export type T${obj.is} = ${obj.implementedBy
      .map((x) => {
        dependencies.addCustom('T' + x, 'struct');
        return 'T' + x;
      })
      .join(' | ')};
    `.trim() +
    renderDoc(
      // prettier-ignore
      `Determines whether a given instance is of a class that implements \`${obj.is}\``
    ) +
    `
      export function is${obj.is.slice(1)}(instance: any): boolean {
        return isInterface('${obj.is}', instance);
      }
    `.trim()
  );
}
