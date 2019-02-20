import { IStructDef } from '~/types';
import assert from 'assert';
import { pkg } from '~/pkg';
import imports from '../../imports';
import Dependencies from '../../Dependencies';
import renderInternal from './internal';
import renderExternal from './external';
import renderArrays from './arrays';
import renderPrivate from './private';

export default function renderPrototypes(arr: IStructDef[]): string {
  const dependencies = new Dependencies();

  dependencies.addCustom('pkg', 'pkg');
  const str = arr.map((x) => each(x, dependencies)).join('\n');
  return (
    imports(dependencies, 'prototypes') +
    `
      function struct(was: string): any {
        return Object.getPrototypeOf(pkg[was].ptr.nil);
      }
      function prop(structWas: string, propIndex: number): any {
        const typ = pkg[structWas].fields[propIndex].typ;
        return Object.getPrototypeOf(typ.nil);
      }
      function zero(structWas: string): any {
        return pkg[structWas].zero();
      }

      const proto: any = {};

    ` +
    str
  );
}

function each(item: IStructDef, dependencies: Dependencies): string {
  const struct = pkg[item.was];
  assert(!!struct);

  return `
    // Assert type on internal object prototype
    proto.${item.is} = Object.defineProperty(
      struct('${item.was}'), '$is', { value: '${item.is}' }
    );
    export const $${item.is} = (): any => ({
      $internal: ${renderInternal(item, dependencies)},
      $external: ${renderExternal(item, dependencies)},
      $arrays: ${renderArrays(item, dependencies)},
      $private: ${renderPrivate(item, dependencies)},
      $zero: zero('${item.was}')
    });
  `.trim();
}
