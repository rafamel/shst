import * as core from '#/core';
import { structs } from '#/core/types';
import sh from '#/sh';
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
      return cb(wrapType(core[structs[type]], node));
    })
  );
}
