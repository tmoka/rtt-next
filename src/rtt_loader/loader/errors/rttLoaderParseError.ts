/**
 * STEP 1. csv -> json 変換 関連の utils
 */

import { ParseError } from 'papaparse'
import { KGExceptionType } from '../../../common/types'
import { RTTLoaderError, RowIdToNumberType, CSVKind } from './rttLoaderError'

/**
 * STEP 1. csv -> json 変換 でのエラー
 */
export class RTTLoaderParseError extends RTTLoaderError {
  name = 'RTTLoaderParseError'

  public readonly csvKind: CSVKind

  public readonly parseErrors: ParseError[]

  public readonly rowIdToNumber: RowIdToNumberType

  constructor(
    csvKind: CSVKind,
    userMessage: string,
    parseErrors: ParseError[],
    rowIdToNumber: RowIdToNumberType,
  ) {
    super(`${userMessage}\nファイル: ${csvKind}.csv`)
    Object.setPrototypeOf(this, RTTLoaderParseError.prototype)

    this.csvKind = csvKind
    this.parseErrors = parseErrors
    this.rowIdToNumber = rowIdToNumber
  }

  public toKGExceptions(): KGExceptionType[] {
    return this.parseErrors.map((err) => ({
      exceptionName: this.name,
      userMessage: `${err.message}\nファイル: ${this.csvKind}.csv, 行: ${
        this.rowIdToNumber[err.row]
      }`,
      debugMessage: '',
    }))
  }
}
