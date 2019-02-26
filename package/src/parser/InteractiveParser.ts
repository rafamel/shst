import BaseParser from './BaseParser';
import { Stmt } from '#/core';
import { IParserOpts } from '~/types';
import { collect, internal, call } from '#/core/util';
import * as externalize from '#/core/externalize';
import uuid from 'uuid/v4';

/**
 * Allows for ongoing parsing. A use case would be parsing incoming statements for an interactive shell.
 */
export default class InteractiveParser extends BaseParser {
  /**
   * All accumulated `Stmt` objects returned by `InteractiveParser.next()`.
   */
  public stmts: Stmt[];
  /**
   * Will be `true` when an unfinished statement has been passed to `InteractiveParser.next()` or it hasn't yet been parsed due to a lack of a newline character.
   */
  public incomplete: boolean;
  /**
   * A partial statement passed to `InteractiveParser.next()` yet to be parsed, either because it's not yet complete, or due to a lack of an ending newline character.
   */
  private pending: string;
  /**
   * Subscribed functions via `InteractiveParser.subscribe()`.
   */
  private subscribers: { [key: string]: (stmts: Stmt[]) => void };
  public constructor(opts: IParserOpts) {
    super(opts);
    this.stmts = [];
    this.pending = '';
    this.incomplete = false;
    this.subscribers = {};
  }
  /**
   * A string to parse. It will return all parsed statements as an array. If the ending statement is unfinished or it lacks a newline character, it won't be returned until a following call to `next()` continues it.
   */
  public next(str: string): Stmt[] {
    let stmts: Stmt[] = [];

    if (!/\n/.exec(str)) {
      this.pending = this.pending + str;
      this.incomplete = true;
      return stmts;
    }

    str = this.pending + str;
    const isIncomplete: boolean = call(() => {
      return collect(this).Interactive(str, (arr: Stmt[]) => {
        stmts = arr.map((x) => externalize.type(internal.get(x)));
        this.stmts.push(...stmts);
      });
    });

    if (stmts.length) {
      Object.values(this.subscribers).forEach((fn) => fn(stmts));
      this.pending = str.slice(
        stmts
          .slice(-1)[0]
          .end()
          .offset()
      );
      this.incomplete = Boolean(this.pending.trim());
    } else if (isIncomplete) {
      this.pending = str;
      this.incomplete = true;
    } else {
      if (this.incomplete) this.incomplete = false;
      if (this.pending) this.pending = '';
    }

    return stmts;
  }
  /**
   * Restarts `InteractiveParser`. It will throw if the last statement passed to `InteractiveParser.parse()` is incomplete. It will NOT unsubscribe subscriptions.
   */
  public end(): Stmt[] {
    if (this.incomplete) throw Error('Last statement is incomplete');

    const stmts = this.stmts;
    this.stmts = [];
    this.pending = '';
    this.incomplete = false;
    return stmts;
  }
  /**
   * Subscribes to all new parsed `Stmt`, as new data is passed to `InteractiveParser.next()`. Returns an `unsubscribe` function.
   */
  public subscribe(fn: (stmts: Stmt[]) => void): () => void {
    const id = uuid();

    this.subscribers[id] = fn;
    return function unsubscribe() {
      delete this.subscribers[id];
    };
  }
}
