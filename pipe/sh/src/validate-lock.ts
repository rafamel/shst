import hash from 'object-hash';

export default function dumpLock(
  types: { [key: string]: any },
  lock: string
): void {
  // Only interested in function types
  const functions = types.funcs;
  const lockHash = hash(functions, {
    algorithm: 'sha1',
    unorderedArrays: true,
    excludeKeys: (key) => key === 'doc'
  });

  if (lock !== lockHash) throw Error(`Lock hash has changed: ${lockHash}`);
}
