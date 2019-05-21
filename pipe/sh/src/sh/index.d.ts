export interface ILogger {
  trace: (...args: any[]) => void;
  debug: (...args: any[]) => void;
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
}

export default function sh(
  window: any,
  global: any,
  ShError: any,
  console: ILogger
): {
  syntax: any;
  packages: any;
};
