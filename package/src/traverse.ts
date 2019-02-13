import * as core from '#/core';
import { structs } from '#/core/types';
import sh from '#/sh';
import { call, collectType, getType, createType } from '#/core/util';

export default function traverse(
  node: core.INode,
  cb: (node: core.INode) => boolean | void
): void {
  call(() =>
    sh.syntax.Walk(collectType(node), (node: any) => {
      if (!node) return true;
      const type = getType(node);
      // @ts-ignore
      return cb(createType(core[structs[type]], node));
    })
  );
}
