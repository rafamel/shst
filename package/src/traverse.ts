import core, { TNode, isNode } from '@shst/core';

/**
 * *DFS* nodes traversal. Will continue traversing in depth if `cb` returns `true` for a given node.
 */
export default function traverse(
  node: TNode,
  cb: (node: TNode) => boolean | void
): void {
  if (!cb(node)) return;

  const arr = core.traversal[node.type];
  for (let prop of arr) {
    const item = (node as any)[prop.is];
    if (prop.list) {
      for (let one of item) {
        if (isNode(one)) traverse(one, cb);
      }
    } else {
      if (isNode(item)) traverse(item, cb);
    }
  }
}
