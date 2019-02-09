import { IInterfaceDef, IMethodDef } from '~/types';
import assert from 'assert';
import { renderType, renderDoc } from './helpers';
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

        const params = method.params
          .map(
            (param): string => {
              dependencies.add(param.value);

              return `${param.name}: ${renderType(param.value, dependencies)}`;
            }
          )
          .join(', ');
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

  dependencies.addCustom('interfaced', 'helpers');
  return (
    renderDoc(obj.doc) +
    `
      export interface ${obj.is} {
        ${methods}
      }
    `.trim() +
    `
      /** 
       * Determines whether a given instance of a class implements \`${obj.is}\`
      */
      export function is${obj.is.slice(1)}(instance: any): boolean {
        return interfaced('${obj.is}', instance);
      }
    `
  );
}
