import sh from '@shast/sh';
import { IFileNode } from '~/types';
import toNode from '~/utils/to-node';
import { SYMBOL } from '~/constants';
import { INode } from '@shast/core';

export default function traverse(
  node: IFileNode,
  cb: (node: INode) => boolean | void
): void {
  sh.syntax.Walk(node[SYMBOL], (srcNode: any) => {
    if (!srcNode) return true;
    const node = toNode(srcNode);
    return cb(node);
  });
}
