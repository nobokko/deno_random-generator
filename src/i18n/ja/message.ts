import ErrorMessage from "../../message.d.ts";
export const errorMsg: ErrorMessage = {
  e001: (varname: string) => {
    return `${varname} は Integerである必要があります`;
  },
  e002: (varname: string) => {
    return `${varname} は 負数に対する処理方法が定義されていません`;
  },
  e003: () => {
    return `取りうる範囲が上限を超えました`;
  },
  e004: (varname: string) => {
    return `${varname} は 32bitの範囲である必要があります`;
  },
};
