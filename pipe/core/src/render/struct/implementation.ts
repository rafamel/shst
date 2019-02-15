import assert from 'assert';
import { IStructDef } from '~/types';
import Dependencies from '~/render/Dependencies';
import { wrapValue, unwrapValue, typeWrap } from './helpers';

export default function renderInternal(
  obj: IStructDef,
  dependencies: Dependencies
): string {
  assert(obj.kind === 'struct');

  dependencies.addCustom('SYMBOL', 'constants');
  dependencies.addCustom('collect', 'util');
  dependencies.addCustom('internal', 'util');

  return `
    const $${obj.is} = {
      root: {
        ${$inner(obj, false, dependencies)}
      },
      internal: {
        $val: {
          get: function() {
            return this;
          }
        }
        ${$inner(obj, true, dependencies)}
      },
      $arrays: {}
    }
    export class ${obj.is} {
      static [SYMBOL] = $${obj.is};
      static type = '${obj.is}';
      ${obj.fields
        .map((field) => {
          dependencies.addCustom('set', 'util');
          return `
            get ${field.is}() {
              return (
                this['${field.is}'] = 
                  ${wrapValue(
                    `collect(this).inner['${field.was}']`,
                    field.value,
                    dependencies
                  )}
              );
            }
            set ${field.is}(value) {
              set(this, '${field.is}', value);
            }
            `.trim();
        })
        .join('\n')}
      ${obj.methods
        .map((method) => {
          dependencies.addCustom('call', 'util');
          return `
          ${method.is}(
            ${method.params.map((param) => param.name).join(', ')}
          ) {
            return call(() => collect(this).outer['${method.was}'](
              ${method.params
                .map((x) => unwrapValue(x.name, x.value, dependencies))
                .join(', ')}
            ));
          }
        `.trim();
        })
        .join('\n')}
      toJSON() {
        return {
          type: '${obj.is}'
          ${obj.fields.length ? ',' : ''}
          ${obj.fields
            .map((field) => `'${field.is}': this['${field.is}']`)
            .join(',\n')}
        };
      }
    }
  `;
}

function $inner(
  obj: IStructDef,
  isInternal: boolean,
  dependencies: Dependencies
): string {
  return `
    ${isInternal && (obj.methods.length || obj.fields.length) ? ',' : ''}
    ${obj.methods
      .map((method) => {
        dependencies.addCustom('collect', 'util');
        if (isInternal) dependencies.addCustom('internal', 'util');

        const str = isInternal
          ? `internal(collect(this).inner)['${method.was}']`
          : `collect(this).inner['${method.was}']`;

        return `
          ${method.was}: {
            value: function ${method.was}(
              ${method.params.map((x) => x.name).join(', ')}
            ) {
              return ${str}
                .call(this, ${method.params.map((x) => x.name).join(', ')});
            }
          }
        `.trim();
      })
      .join('\n,')}
    ${obj.methods.length && obj.fields.length ? ',' : ''}
    ${obj.fields
      .map((field) => {
        dependencies.addCustom('collect', 'util');

        let str = `collect(this).instance['${field.is}']`;
        if (isInternal) {
          if (field.value.list) {
            dependencies.addCustom('internalArray', 'util');
            str = `internalArray.call(
              this,
              '${field.is}',
              '${field.was}',
              ${String(typeWrap(field.value))}
            )`;
          } else if (typeWrap(field.value)) {
            dependencies.addCustom('internal', 'util');
            str = `internal(collect(${str}).outer)`;
          }
        } else if (typeWrap(field.value)) {
          if (field.value.list) str = `${str}.map(x => collect(x).outer)`;
          else str = `collect(${str}).outer`;
        }

        return `
          ${field.was}: {
            get: function() {
              return ${str};
            }
          }
        `.trim();
      })
      .join('\n,')}
  `.trim();
}
