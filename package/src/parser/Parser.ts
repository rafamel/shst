import core, { File } from '@shst/core';
import BaseParser from './BaseParser';

/**
 * Allows configuration of parsing options applied when parsing shell scripts.
 */
export default class Parser extends BaseParser {
  /**
   * Parses a shell script.
   */
  public parse(str: string, name?: string): File {
    return core.externalize.type(
      core.internal.get(core.call(() => core.collect(this).Parse(str, name)))
    );
  }
}
