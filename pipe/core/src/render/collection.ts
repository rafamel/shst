import { TTypeDef, IEnumDef, IInterfaceDef, IStructDef } from '~/types';
import Dependencies from './Dependencies';

type TCb =
  | ((item: IEnumDef, dependencies: Dependencies) => string)
  | ((item: IInterfaceDef, dependencies: Dependencies) => string)
  | ((item: IStructDef, dependencies: Dependencies) => string);

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function collection(arr: TTypeDef[], cb: TCb) {
  const dependencies = new Dependencies();
  const render: string = arr.reduce((acc: string, item: TTypeDef) => {
    // @ts-ignore
    return acc + cb(item, dependencies);
  }, '');

  return { dependencies, render };
}
