import { IFieldDef } from '~/types';
import Dependencies from '../Dependencies';
import { renderType, renderDoc } from '../helpers';
import { ownProp, wrapValue, unwrapValue } from './helpers';

export default function renderField(
  field: IFieldDef,
  dependencies: Dependencies
): string {
  dependencies.add(field.value);
  dependencies.addCustom('call', 'util');
  return (
    renderDoc(field.doc) +
    `
    public get ${field.is}(): ${renderType(field.value, 'out', dependencies)} {
      return ${wrapValue(
        ownProp(field, dependencies),
        field.value,
        dependencies
      )};
    }
    public set ${field.is}(value: ${
      // 'out' as getters must have the same type as setters
      renderType(field.value, 'out', dependencies)
    }) {
      call(() => (${ownProp(field, dependencies)} = ${unwrapValue(
      'value',
      field.value,
      dependencies
    )}));
    }
  `.trim()
  );
}
