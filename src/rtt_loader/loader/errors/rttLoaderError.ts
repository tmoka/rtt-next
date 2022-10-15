import { KGExceptionType } from '../../../common/types';

/**
 * csvの種類を表す型
 */
export enum CSVKind {
  LINK = 'link',
  POINT = 'point',
  SETSU = 'setsu',
  TORISHIN = 'torishin',
}

/**
 * rowId と rowNumber の対応を表すデータの型
 *
 * `rowIdToNumber[rowId] = rowNumber` という関係になっている
 */
export type RowIdToNumberType = number[];

/**
 * STEP 1. -- 3. のエラーの親クラス
 */
export class RTTLoaderError extends Error {
  name = 'RTTLoaderError';

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, RTTLoaderError.prototype);
  }

  public toKGExceptions(): KGExceptionType[] {
    return [
      {
        exceptionName: this.name,
        userMessage: this.message,
        debugMessage: '',
      },
    ];
  }
}
