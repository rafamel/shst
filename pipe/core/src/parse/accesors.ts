import { ITypeDefMap, IStructDef, IAccesor } from '~/types';
import assert from 'assert';

export default function defineAccessors(all: ITypeDefMap): void {
  const done: string[] = [];

  Object.values(all)
    .filter((x) => x.kind === 'struct')
    .forEach((current) => each(current as IStructDef, all, done));
}

function each(current: IStructDef, all: ITypeDefMap, done: string[]): void {
  assert(current.kind === 'struct');

  // return if already done
  if (done.includes(current.is)) return;

  // Mark as done
  done.push(current.is);

  // collect embedded fields
  const embedded = current.fields.filter((x) => x.embedded);
  // if no embedded, return
  if (!embedded.length) return;

  // if embedded, run all inner embedded ones first
  embedded.forEach((field) => {
    assert(field.value.kind === 'struct');
    assert(all[field.value.type]);

    each(all[field.value.type] as IStructDef, all, done);
  });

  // define accessors
  const accessors: IAccesor[] = [];
  embedded.forEach((field) => {
    const struct = all[field.value.type] as IStructDef;
    struct.fields.forEach((inner) => {
      accessors.push({
        as: 'field',
        struct: struct.is,
        path: [field.is],
        def: inner
      });
    });
    struct.methods.forEach((inner) => {
      accessors.push({
        as: 'method',
        struct: struct.is,
        path: [field.is],
        def: inner
      });
    });
    struct.accessors.forEach((inner) => {
      accessors.push({
        ...inner,
        path: [field.is, ...inner.path]
      });
    });
  });

  const nonUniqueWas = accessors
    .map((x) => x.def.was)
    .filter((x, i, arr) => arr.lastIndexOf(x) !== i);
  const nonUniqueIs = accessors
    .map((x) => x.def.is)
    .filter((x, i, arr) => arr.lastIndexOf(x) !== i);
  const ownWas = current.fields
    .map((x) => x.was)
    .concat(current.methods.map((x) => x.was));
  const ownIs = current.fields
    .map((x) => x.is)
    .concat(current.methods.map((x) => x.is));

  current.accessors = accessors
    .map((item) => {
      // If repeated, don't include
      if (nonUniqueWas.includes(item.def.was)) return;

      assert(!nonUniqueIs.includes(item.def.is));

      // If there is an own field/method, don't include
      if (ownWas.includes(item.def.was)) return;
      assert(!ownIs.includes(item.def.is));

      return item;
    })
    .filter(Boolean) as IAccesor[];
}
