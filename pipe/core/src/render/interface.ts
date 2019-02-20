import { IInterfaceDef, IMethodDef } from '~/types';
import assert from 'assert';
import { renderType, renderDoc, renderParams } from './helpers';
import Dependencies from './Dependencies';

export default function renderInterface(
  obj: IInterfaceDef,
  dependencies: Dependencies
): string {
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
      export interface ${obj.is} {
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
      'Determines whether a given instance is of a class that implements ' +
        `\`${obj.is}\``
    ) +
    `
      export function is${obj.is.slice(1)}(instance: any): boolean {
        return isInterface('${obj.is}', instance);
      }
    `.trim()
  );
}
