import { TTypeDef } from '~/types';
import renderEnum from './enum';
import renderInterface from './interface';
import renderStruct from './struct';
import Dependencies from './Dependencies';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function collection(arr: TTypeDef[]) {
  const dependencies = new Dependencies();
  const render: string = arr.reduce((acc: string, item: TTypeDef) => {
    switch (item.kind) {
      case 'enum':
        return acc + renderEnum(item, dependencies);
      case 'interface':
        return acc + renderInterface(item, dependencies);
      case 'struct':
        return acc + renderStruct(item, dependencies);
      default:
        // eslint-disable-next-line no-console
        console.error(item);
        throw Error('Kind could not be identified');
    }
  }, '');

  return { dependencies, render };
}
