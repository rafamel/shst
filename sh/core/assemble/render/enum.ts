import { IEnumDef } from '../../types';
import assert from 'assert';
import { renderDoc } from './helpers';
import Dependencies from '../Dependencies';

export default function renderEnum(
  obj: IEnumDef,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dependencies: Dependencies
): string {
  assert(obj.kind === 'enum');

  return (
    renderDoc(obj.doc) +
    `
      export enum ${obj.is} { 
        ${obj.values.map((name, i) => name + ' = ' + i).join(', ')}
      }
    `
  );
}
