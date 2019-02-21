import {
  IStructDef,
  IFieldDef,
  IPrivateDef,
  IMethodDef,
  IAccesor
} from '~/types';
import assert from 'assert';
import { renderDoc, renderType, renderParams, typeWrap } from '../helpers';
import Dependencies from '../Dependencies';
import camelcase from 'camelcase';
import imports from '../imports';

export default function renderDeclaration(arr: IStructDef[]): string {
  const dependencies = new Dependencies();

  const str = arr.map((item) => each(item, dependencies)).join('\n');

  return imports(dependencies, 'struct') + str;
}

export function each(obj: IStructDef, dependencies: Dependencies): string {
  assert(obj.kind === 'struct');

  return (
    renderDoc(`\`${obj.is}\` as a plain object.`) +
    `
    export interface I${obj.is} {
      ${[`type: '${obj.is}'`]
        .concat(obj.fields.map((field) => json(field, false, dependencies)))
        .concat(obj.private.map((field) => json(field, true, dependencies)))
        .join(';\n')}
    }
    `.trim() +
    renderDoc(obj.doc) +
    `
    export class ${obj.is} {
      private static type: '${obj.is}';
      public static fromJSON(plain: I${obj.is}): ${obj.is};
      ${constructor(obj, dependencies)};
      public readonly type: '${obj.is}';
      ${obj.fields.map((field) => fields(field, dependencies)).join(';\n')}
      ${obj.methods.map((method) => methods(method, dependencies)).join(';\n')}
      ${obj.accessors
        .map((accessor) => accessors(accessor, obj, dependencies))
        .join(';\n')}
      public toJSON(): I${obj.is};
    }
    `
  );
}

export function constructor(
  item: IStructDef,
  dependencies: Dependencies
): string {
  return item.fields.length
    ? `
      public constructor(
        fields: {
          ${item.fields
            .map(
              (field) => `${field.is}: ${renderType(field.value, dependencies)}`
            )
            .join('; ')}
        }
      )
    `.trim()
    : 'public constructor()';
}

export function json(
  field: IFieldDef | IPrivateDef,
  isPrivate: boolean,
  dependencies: Dependencies
): string {
  let type = renderType(field.value, dependencies);
  if (typeWrap(field.value)) {
    if (field.value.kind === 'interface') {
      dependencies.addCustom('TI' + field.value.type.slice(1), 'interface');
      type = 'TI' + type.slice(1);
    } else {
      type = 'I' + type;
    }
  }
  return `${isPrivate ? '$' : ''}${field.is}: ${type}`;
}

export function fields(field: IFieldDef, dependencies: Dependencies): string {
  return (
    renderDoc(field.doc) +
    `
      public ${field.is}: ${renderType(field.value, dependencies)}
    `.trim()
  );
}

export function methods(
  method: IMethodDef,
  dependencies: Dependencies
): string {
  return (
    renderDoc(method.doc) +
    `
      public ${method.is}(${renderParams(method.params, dependencies)}):
        ${renderType(method.returns, dependencies)} 
    `.trim()
  );
}

export function accessors(
  accessor: IAccesor,
  item: IStructDef,
  dependencies: Dependencies
): string {
  switch (accessor.as) {
    case 'field':
      return (
        renderDoc(
          `A getter property. Shorthand for \`${[camelcase(item.is)]
            .concat(accessor.path)
            .concat(accessor.def.is)
            .join('.')}\``
        ) +
        `public readonly ${accessor.def.is}: ${renderType(
          (accessor.def as IFieldDef).value,
          dependencies
        )}`
      );
    case 'method':
      return methods(
        {
          ...accessor.def,
          doc:
            `Shorthand for \`${accessor.struct}.${accessor.def.is}\` ` +
            `method, found at \`${[camelcase(item.is)]
              .concat(accessor.path)
              .concat(accessor.def.is)
              .join('.')}()\``
        } as IMethodDef,
        dependencies
      );
    default:
      throw Error('Accessor is not "field" or "method"');
  }
}
