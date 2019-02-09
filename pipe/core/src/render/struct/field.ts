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
    public get ${field.is}(): ${renderType(field.value, dependencies)} {
      return ${wrapValue(
        ownProp(field, dependencies),
        field.value,
        dependencies
      )};
    }
    public set ${field.is}(value: ${renderType(field.value, dependencies)}) {
      call(() => (${ownProp(field, dependencies)} = ${unwrapValue(
      'value',
      field.value,
      dependencies
    )}));
    }
  `.trim()
  );
}
