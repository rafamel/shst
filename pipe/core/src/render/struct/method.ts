import { IMethodDef } from '~/types';
import Dependencies from '../Dependencies';
import { renderType, renderDoc } from '../helpers';
import { ownProp, wrapValue, unwrapValue } from './helpers';

export default function renderMethod(
  method: IMethodDef,
  dependencies: Dependencies
): string {
  dependencies.add(method.returns);

  const params = method.params
    .map(
      (param): string => {
        dependencies.add(param.value);

        return `${param.name}: ${renderType(param.value, dependencies)}`;
      }
    )
    .join(', ');

  const returns = wrapValue(
    `${ownProp(method, dependencies)}(
        ${method.params.map((item) =>
          unwrapValue(item.name, item.value, dependencies)
        )}
      )`,
    method.returns,
    dependencies
  );

  dependencies.addCustom('call', 'util');
  return (
    renderDoc(method.doc) +
    `public ${method.is}(${params}): ${renderType(
      method.returns,
      dependencies
    )} {
      return call(() => ${returns});
    }`
  );
}
