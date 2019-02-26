import { File } from '#/core';
import { collect, internal, call } from '#/core/util';
import * as externalize from '#/core/externalize';
import BaseParser from './BaseParser';

/**
 * Allows configuration of parsing options applied when parsing shell scripts.
 */
export default class Parser extends BaseParser {
  /**
   * Parses a shell script.
   */
  public parse(str: string, name?: string): File {
    return externalize.type(
      internal.get(call(() => collect(this).Parse(str, name)))
    );
  }
}
