import types, * as core from '@shast/core';
import sh from '@shast/sh';
import { call, unwrapType, getType, wrapType } from './utils';

export default function traverse(
  node: core.INode,
  cb: (node: core.INode) => boolean | void
): void {
  call(() =>
    sh.syntax.Walk(unwrapType(node), (node: any) => {
      if (!node) return true;
      const type = getType(node);
      // @ts-ignore
      return cb(wrapType(core[types.structs[type]], node));
    })
  );
}
