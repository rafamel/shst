import { IStructDef, IPrivateDef } from '~/types';
import Dependencies from '../Dependencies';
import { renderType, externalize } from '../helpers';

export default function renderPrivate(
  item: IStructDef,
  dependencies: Dependencies
): string {
  return `{
    ${item.private.map((field) => each(field, dependencies)).join(',\n')}
  }`;
}

export function each(field: IPrivateDef, dependencies: Dependencies): string {
  dependencies.addCustom('collect', 'util');
  dependencies.addCustom('set', 'util');

  return `
    get ${field.is}(): ${renderType(field.value, dependencies)} {
      return (
        this.${field.is} = 
          ${externalize(
            field.value,
            `collect(this).source.${field.was}`,
            dependencies
          )}
      );
    },
    set ${field.is}(value: ${renderType(field.value, dependencies)}) {
      set(this, '${field.is}', value);
    }
  `.trim();
}
