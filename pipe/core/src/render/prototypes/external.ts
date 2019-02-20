import { IStructDef, IFieldDef, IMethodDef } from '~/types';
import Dependencies from '../Dependencies';
import { typeWrap, externalize } from '../helpers';

export default function renderExternal(
  item: IStructDef,
  dependencies: Dependencies
): string {
  const str = item.fields
    .map((field) => fields(field, dependencies))
    .concat(item.methods.map((method) => methods(method, dependencies)))
    .join(',\n');

  return `{ ${str} }`;
}

export function fields(field: IFieldDef, dependencies: Dependencies): string {
  dependencies.addCustom('collect', 'util');
  let str = `collect(this).instance.${field.is}`;

  if (field.value.list) {
    str += '.map((x: any) => collect(x).external)';
  } else if (typeWrap(field.value)) {
    str = `collect(${str}).external`;
  }

  return `
    get ${field.was}() {
      return ${str};
    }
  `.trim();
}

export function methods(
  method: IMethodDef,
  dependencies: Dependencies
): string {
  let str = `
    collect(this).internal.${method.was}(
      ${method.params
        .map((param) => {
          if (typeWrap(param.value)) {
            dependencies.addCustom('internal', 'util');
            return param.value.list
              ? `${param.name}.map($x => internal.get($x))`
              : `internal.get(${param.name})`;
          }
          return param.name;
        })
        .join(', ')}
    )
  `.trim();

  str = externalize(method.returns, str, dependencies);
  if (typeWrap(method.returns)) str += '.external';

  return `
    ${method.was}(
      ${method.params.map((param) => param.name + ': any').join(', ')}
    ) {
      return ${str};
    }
  `.trim();
}
