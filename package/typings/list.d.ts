export { from } from '@/list';

/**
 * An immutable [`List`](https://github.com/funkia/list/).
 * Only `toArray()` and `fromArray()` are exported from this module,
 * but you can choose to use any of [`list`'s available apis.](https://github.com/funkia/list/#api-styles)
 */
export class List<A> {
  readonly length: number;
  public toJSON(): A[];
}

/**
 * Turns an immutable `List` into a JS array.
 */
export function toArray<A>(list: List<A>): A[];

/**
 * Turns an array or iterable into an immutable `List`
 */
export function fromArray<A>(arr: A[] | ArrayLike<A> | Iterable<A>): List<A>;
