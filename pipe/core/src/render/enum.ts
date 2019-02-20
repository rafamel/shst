import { IEnumDef } from '~/types';
import assert from 'assert';
import { renderDoc } from './helpers';

export default function renderEnum(arr: IEnumDef[]): string {
  return arr.map(each).join('\n');
}

export function each(item: IEnumDef): string {
  assert(item.kind === 'enum');

  return (
    renderDoc(item.doc) +
    `
      export enum ${item.is} { 
        ${item.values.map((name, i) => name + ' = ' + i).join(', ')}
      }
    `.trim()
  );
}
