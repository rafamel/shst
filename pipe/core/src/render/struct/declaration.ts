import { IStructDef } from '~/types';
import assert from 'assert';
import { renderDoc, renderType, renderParams } from '../helpers';
import Dependencies from '../Dependencies';

export default function renderStruct(
  obj: IStructDef,
  dependencies: Dependencies
): string {
  assert(obj.kind === 'struct');

  const fields = obj.fields
    .map((field) => {
      return (
        renderDoc(field.doc) +
        `
          public ${field.is}: ${renderType(field.value, dependencies)}
        `.trim()
      );
    })
    .join('\n');

  const methods = obj.methods
    .map((method) => {
      return (
        renderDoc(method.doc) +
        `
          public ${method.is}(${renderParams(method.params, dependencies)}):
            ${renderType(method.returns, dependencies)} 
        `.trim()
      );
    })
    .join('\n');

  const toJson = `
    public toJSON(): {
      ${obj.fields
        .map((field) => `${field.is}: ${renderType(field.value, dependencies)}`)
        .join(',\n')}
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
        public static type: '${obj.is}';
        ${fields}
        ${methods}
        ${toJson}
      }
    `
  );
}
