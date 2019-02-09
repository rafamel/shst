import { IStructDef } from '~/types';
import assert from 'assert';
import { renderDoc } from '../helpers';
import Dependencies from '../Dependencies';
import renderMethod from './method';
import renderField from './field';

export default function renderStruct(
  obj: IStructDef,
  dependencies: Dependencies
): string {
  assert(obj.kind === 'struct');

  const fields = obj.fields
    .map((field) => renderField(field, dependencies))
    .join('\n');

  const methods = obj.methods
    .map((method) => renderMethod(method, dependencies))
    .join('\n');

  const toJson = `
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    public toJSON() {
      return {
        ${obj.fields
          .map((field) => `'${field.is}': this['${field.is}']`)
          .join(',\n')}
      }
    }
  `.trim();

  obj.implements.forEach((type) => dependencies.addCustom(type, 'interface'));
  const implement = obj.implements.length
    ? 'implements ' + obj.implements.join(', ')
    : '';

  return (
    renderDoc(obj.doc) +
    `
      export class ${obj.is} ${implement} {
        public static type: string = '${obj.is}';
        ${fields}
        ${methods}
        ${toJson}
      }
    `
  );
}
