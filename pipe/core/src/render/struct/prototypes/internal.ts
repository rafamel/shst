import { IStructDef, IFieldDef, IPrivateDef } from '~/types';
import Dependencies from '../../Dependencies';
import { typeWrap, externalize } from '../../helpers';

export default function renderInternal(
  item: IStructDef,
  dependencies: Dependencies
): string {
  const str: string = [
    `
      $val: {
        get: function $val() {
          return this;
        }
      }
    `
  ]
    .concat(item.fields.map((field) => fields(field, false, dependencies)))
    .concat(item.private.map((field) => fields(field, true, dependencies)))
    .join(',\n');

  return `Object.create(proto.${item.is}, { ${str} })`;
}

export function fields(
  field: IFieldDef | IPrivateDef,
  isPrivate: boolean,
  dependencies: Dependencies
): string {
  dependencies.addCustom('collect', 'util');

  let get = isPrivate
    ? `collect(this).private.${field.is}`
    : `collect(this).instance.${field.is}`;
  const set = `${get} = ${externalize(field.value, 'value', dependencies)}`;

  if (field.value.list) {
    dependencies.addCustom('internal', 'util');
    get = `internal.array.create(this, '${isPrivate ? '$' : ''}${field.is}')`;
  } else if (typeWrap(field.value)) {
    get = `collect(${get}).internal`;
  }

  return `
    ${field.was}: {
      get: function ${field.was}() {
        return ${get};
      },
      set: function ${field.was}(value: any) {
        ${set};
      }
    }
  `.trim();
}
