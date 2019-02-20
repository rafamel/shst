import { IStructDef } from '~/types';
import Dependencies from '../../Dependencies';

export default function renderConstructor(
  obj: IStructDef,
  dependencies: Dependencies
): string {
  dependencies.addCustom('collect', 'util');
  dependencies.addCustom('seed', 'externalize');

  return obj.fields.length
    ? `
      constructor(fields = {}) {
        seed(this, this.constructor);
        ${obj.fields
          .map((field) => `this.${field.is} = fields.${field.is};`)
          .join('\n')}
      }
    `
    : `
      constructor() {
        seed(this, this.constructor);
      }
    `;
}
