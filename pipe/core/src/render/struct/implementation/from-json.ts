import { IStructDef, IFieldDef, IPrivateDef } from '~/types';
import Dependencies from '~/render/Dependencies';
import { typeWrap } from '../../helpers';

export default function renderFromJSON(
  obj: IStructDef,
  dependencies: Dependencies
): string {
  const setPrivate = (): string => {
    if (!obj.private.length) return 'return instance';
    dependencies.addCustom('collect', 'util');

    return `
      const { private: p } = collect(instance);
      ${obj.private
        .map((field) => `p.${field.is} = ${each(field, true, dependencies)}`)
        .join(';\n')}
      return instance;
    `.trim();
  };

  return obj.fields.length || obj.private.length
    ? `
      static fromJSON(plain = {}) {
        const instance = new this({
          ${obj.fields
            .map((field) => `${field.is}: ${each(field, false, dependencies)}`)
            .join(',\n')}
        });
        ${setPrivate()}
      }
    `
    : `
      static fromJSON() {
        return new this();
      }
    `;
}

export function each(
  field: IFieldDef | IPrivateDef,
  isPrivate: boolean,
  dependencies: Dependencies
): string {
  const key = isPrivate ? `$${field.is}` : field.is;

  if (typeWrap(field.value)) {
    dependencies.addCustom('fromJSON', 'from-json');
    if (field.value.list) return `plain.${key}.map(x => fromJSON(x))`;
    if (field.value.pointer) {
      return `plain.${key} ? fromJSON(plain.${key}) : null`;
    }

    return `fromJSON(plain.${key})`;
  }
  return `plain.${key}`;
}
