import { IInterfaceDef } from '~/types';
import assert from 'assert';
import { renderDoc } from './helpers';
import Dependencies from './Dependencies';
import imports from './imports';

export default function renderInterface(arr: IInterfaceDef[]): string {
  const dependencies = new Dependencies();
  const str = arr.map((item) => each(item, dependencies)).join('\n');

  return (
    '/* eslint-disable import/named */\n' +
    imports(dependencies, 'interface') +
    str
  );
}

export function each(obj: IInterfaceDef, dependencies: Dependencies): string {
  assert(obj.kind === 'interface');

  dependencies.addCustom('isInterface', 'util');
  obj.implementedBy.forEach((x) => dependencies.addCustom(x, 'struct'));

  return (
    renderDoc(
      `Any class qualifying as *${obj.was}*` + (obj.doc ? '. ' + obj.doc : '')
    ) +
    `export type ${obj.is} = ${obj.implementedBy.join(' | ')};` +
    renderDoc(`Any \`${obj.is}\` as a plain object`) +
    `
      export type TI${obj.was} = ${obj.implementedBy
      .map((x) => {
        dependencies.addCustom('I' + x, 'struct');
        return 'I' + x;
      })
      .join(' | ')};
    `.trim() +
    renderDoc(
      // prettier-ignore
      `Determines whether a given instance is a \`${obj.is}\` valid *${obj.was}*`
    ) +
    `
      export function is${obj.is.slice(1)}(instance: any): boolean {
        return isInterface('${obj.is}', instance);
      }
    `.trim()
  );
}
