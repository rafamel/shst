import { SYMBOL } from '~/constants';

export default class RootModel {
  // @ts-ignore
  private [SYMBOL]: any;
  public constructor() {
    // TODO
    throw Error('[PENDING] Classes cannot be externally instantiated');
  }
}
