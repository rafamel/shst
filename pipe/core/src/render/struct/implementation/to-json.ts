import { IStructDef, IFieldDef, IPrivateDef } from '~/types';
import { typeWrap } from '../../helpers';
import Dependencies from '../../Dependencies';

export default function renderToJSON(
  obj: IStructDef,
  dependencies: Dependencies
): string {
  return `
    toJSON() {
      return {
        ${[`type: '${obj.is}'`]
          .concat(obj.fields.map((field) => each(field, false, dependencies)))
          .concat(obj.private.map((field) => each(field, true, dependencies)))
          .join(',\n')}
      };
    }
  `;
}

export function each(
  field: IFieldDef | IPrivateDef,
  isPrivate: boolean,
  dependencies: Dependencies
): string {
  let str = `${field.is}: this.${field.is}`;
  if (isPrivate) {
    dependencies.addCustom('collect', 'util');
    str = `$${field.is}: collect(this).private.${field.is}`;
  }

  if (typeWrap(field.value)) {
    if (field.value.list) str += '.map(x => x.toJSON())';
    else str += '.toJSON()';
  }
  return str;
}
