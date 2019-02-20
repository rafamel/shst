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

  const ttype =
    renderDoc(`Any class that implements \`IType\``) +
    `export type TType = ${arr.map((item) => item.is).join(' | ')};`;
  return imports(dependencies, 'struct') + ttype + str;
}

export function each(obj: IStructDef, dependencies: Dependencies): string {
  assert(obj.kind === 'struct');

  obj.implements.forEach((type) => dependencies.addCustom(type, 'interface'));
  const implement = obj.implements.length
    ? `implements ${obj.implements.join(', ')}`
    : '';

  return (
    renderDoc(`\`${obj.is}\` as a plain object.`) +
    `
    export type T${obj.is} = {
      ${[`type: '${obj.is}'`]
        .concat(obj.fields.map((field) => json(field, false, dependencies)))
        .concat(obj.private.map((field) => json(field, true, dependencies)))
        .join(';\n')}
    }
    `.trim() +
    renderDoc(obj.doc) +
    `
    export class ${obj.is} ${implement} {
      public static type: '${obj.is}';
      public static fromJSON(plain: T${obj.is}): ${obj.is};
      ${constructor(obj, dependencies)};
      public type: '${obj.is}';
      ${obj.fields.map((field) => fields(field, dependencies)).join(';\n')}
      ${obj.methods.map((method) => methods(method, dependencies)).join(';\n')}
      ${obj.accessors
        .map((accessor) => accessors(accessor, obj, dependencies))
        .join(';\n')}
      public toJSON(): T${obj.is};
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
  if (field.value.kind === 'interface') {
    dependencies.addCustom('T' + field.value.type, 'interface');
  }
  return `${isPrivate ? '$' : ''}${field.is}: ${
    typeWrap(field.value) ? 'T' : ''
  }${renderType(field.value, dependencies)}`;
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
      return fields(
        {
          ...accessor.def,
          doc: `A getter property. Shorthand for \`${[camelcase(item.is)]
            .concat(accessor.path)
            .concat(accessor.def.is)
            .join('.')}\``
        } as IFieldDef,
        dependencies
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
