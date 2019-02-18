import assert from 'assert';
import { IStructDef } from '~/types';
import Dependencies from '~/render/Dependencies';
import { wrapValue, unwrapValue, typeWrap } from './helpers';
import sh from '#/sh';

const syntaxPkg = sh.packages['mvdan.cc/sh/syntax'];
export default function renderInternal(
  obj: IStructDef,
  dependencies: Dependencies
): string {
  assert(obj.kind === 'struct');
  // TODO remove try/catch (keep assert) once types json match sh version
  try {
    assert(!!syntaxPkg[obj.was]['ptr'].nil);
  } catch (e) {
    console.log(obj.was, 'skipped');
    return '';
  }

  dependencies.addCustom('SYMBOL', 'constants');
  dependencies.addCustom('collect', 'util');
  dependencies.addCustom('internal', 'util');
  dependencies.addCustom('innerProto', 'util');
  dependencies.addCustom('set', 'util');

  return `
    const $${obj.is} = () => ({
      $root: Object.defineProperties({}, {
        ${$inner(obj, false, dependencies)}
      }),
      $internal: Object.create(
        innerProto('${obj.was}'),
        {
          $val: {
            get: function() {
              return this;
            }
          }
          ${$inner(obj, true, dependencies)}
        }
      ),
      $arrays: {
        ${obj.fields
          .filter((x) => x.value.list)
          .map((field) => {
            dependencies.addCustom('propProto', 'util');
            const arr = syntaxPkg[obj.was].fields
              .map(({ prop }: any, i: number) => ({ i, prop }))
              .filter((x: any) => x.prop === field.was);
            // TODO remove try/catch (keep assert) once types json match sh version
            try {
              assert(arr.length === 1);
            } catch (e) {
              console.log(obj.was, field.was, 'skipped');
              return `${field.is}: {}`;
            }

            return `${field.is}: propProto(
              '${obj.is}',
              ${arr[0].i},
              '${field.is}',
              ${String(typeWrap(field.value))}
            )`;
          })
          .join(',\n')}
      }
    });
    export class ${obj.is} {
      static get [SYMBOL]() {
        return set(this, SYMBOL, $${obj.is}());
      };
      static type = '${obj.is}';
      ${obj.fields
        .map((field) => {
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
              return ${wrapValue(
                `call(() => collect(this).outer['${method.was}'](
                  ${method.params
                    .map((x) => unwrapValue(x.name, x.value, dependencies))
                    .join(', ')}
                  ))`,
                method.returns,
                dependencies
              )};
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
            str = `internalArray.call(this, '${field.is}')`;
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
