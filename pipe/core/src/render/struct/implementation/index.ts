import assert from 'assert';
import { IStructDef, IMethodDef, IFieldDef, IAccesor } from '~/types';
import Dependencies from '~/render/Dependencies';
import { externalize, typeWrap } from '../../helpers';
import renderFromJSON from './from-json';
import renderConstructor from './constructor';
import renderToJSON from './to-json';

export default function renderInternal(
  obj: IStructDef,
  dependencies: Dependencies
): string {
  assert(obj.kind === 'struct');

  dependencies.addCustom('SYMBOL', 'constants');
  dependencies.addCustom('set', 'util');
  dependencies.addCustom('$' + obj.is, 'prototypes');

  return `
    export class ${obj.is} {
      static get [SYMBOL]() {
        return set(this, SYMBOL, $${obj.is}());
      };
      static type = '${obj.is}';
      ${renderFromJSON(obj, dependencies).trim()}
      ${renderConstructor(obj, dependencies).trim()}
      ${obj.fields.map((field) => fields(field, dependencies)).join('\n')}
      ${obj.methods.map((method) => methods(method, dependencies)).join('\n')}
      ${obj.accessors.map((accessor) => accessors(accessor)).join('\n')}
      ${renderToJSON(obj, dependencies).trim()}
    }
  `;
}

export function fields(field: IFieldDef, dependencies: Dependencies): string {
  dependencies.addCustom('collect', 'util');
  return `
    get ${field.is}() {
      return (
        this.${field.is} = 
          ${externalize(
            field.value,
            `collect(this).source.${field.was}`,
            dependencies
          )}
      );
    }
    set ${field.is}(value) {
      set(this, '${field.is}', value);
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
            dependencies.addCustom('collect', 'util');
            return param.value.list
              ? `${param.name}.map($x => collect($x).internal)`
              : `collect(${param.name}).internal`;
          }
          return param.name;
        })
        .join(', ')}
    )
  `.trim();

  str = externalize(method.returns, str, dependencies);

  dependencies.addCustom('call', 'util');
  return `
    ${method.is}(${method.params.map((param) => param.name).join(', ')}) {
      return call(() => ${str});
    }
  `.trim();
}

export function accessors(accessor: IAccesor): string {
  switch (accessor.as) {
    case 'field':
      return `
        get ${accessor.def.is}() {
          return ${['this']
            .concat(accessor.path)
            .concat(accessor.def.is)
            .join('.')}
        }
      `.trim();
    case 'method':
      const params = (accessor.def as IMethodDef).params
        .map((x) => x.name)
        .join(', ');
      return `
        ${accessor.def.is}(${params}) {
          return ${['this']
            .concat(accessor.path)
            .concat(accessor.def.is)
            .join('.')}(${params})
        }
      `.trim();
    default:
      throw Error('Accessor is not "field" or "method"');
  }
}
