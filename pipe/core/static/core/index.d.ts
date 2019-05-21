declare const core: {
  classes: unknown;
  types: {
    interfaces: {
      [key: string]: {
        [key: string]: boolean;
      };
    };
    traversal: {
      [key: string]: Array<{
        is: string;
        list: boolean;
      }>;
    };
  };
};
export default core;
