import { IStructDef, IFieldDef, IPrivateDef } from '~/types';
import Dependencies from '../Dependencies';
import { typeWrap } from '../helpers';

export default function renderArrays(
  item: IStructDef,
  dependencies: Dependencies
): string {
  return `{
    ${item.fields
      .filter((x) => x.value.list)
      .map((field) => each(field, item, false, dependencies))
      .concat(
        item.private
          .filter((x) => x.value.list)
          .map((field) => each(field, item, true, dependencies))
      )
      .join(',\n')}
  }`;
}

export function each(
  field: IFieldDef | IPrivateDef,
  item: IStructDef,
  isPrivate: boolean,
  dependencies: Dependencies
): string {
  dependencies.addCustom('internal', 'util');

  return (
    (isPrivate ? '$' : '') +
    `${field.is}: Object.create(
      prop('${item.was}', ${field.index}),
      internal.array.descriptor(
        '${field.is}',
        ${String(isPrivate)},
        ${String(typeWrap(field.value))}
      )
    )`
  );
}
