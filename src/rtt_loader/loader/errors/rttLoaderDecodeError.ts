/**
 * STEP 2. json 型チェック 関連の utils
 */

import * as t from 'io-ts'
import { Reporter } from 'io-ts/lib/Reporter'
import { pipe } from 'fp-ts/lib/pipeable'
import { left, fold } from 'fp-ts/lib/Either'
import * as humps from 'humps'
import { KGExceptionType, CSV_RUNTYPE_NAME_TO_JA } from '../../../common/types'
import { RTTLoaderError, CSVKind, RowIdToNumberType } from './rttLoaderError'

/**
 * RTTLoaderDecodeError の1つ1つのエラーを表す型
 */
interface CSVDecodeErrorReportType {
  message: string
  rowId: number
  colName: string
}

/**
 * json 型チェックの結果が成功だったときの処理
 */
const onDecodeSuccess = (): CSVDecodeErrorReportType[] => []

/**
 * json 型チェックの結果が失敗だったときの処理
 */
const onDecodeFailure = (errors: t.Errors): CSVDecodeErrorReportType[] =>
  errors.map((err) => {
    const { value, context, message } = err
    const valueStr =
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      value === undefined || value === '' ? '空白' : `"${value}"`
    const rowId = Number(context[1].key)
    const colName = humps.decamelize(context[2].key)
    const colTypeNameJa = CSV_RUNTYPE_NAME_TO_JA[context[2].type.name]
    return {
      message: message || `不正な値です: ${valueStr} (必要なデータタイプ: ${colTypeNameJa})`,
      rowId,
      colName,
    }
  })

/**
 * json 型チェックの結果をユーザにわかりやすいメッセージに変換する
 *
 * 参照: https://github.com/gcanti/io-ts#error-reporters
 */
const CSVDecodeErrorReporter: Reporter<CSVDecodeErrorReportType[]> = {
  report: (validation) => pipe(validation, fold(onDecodeFailure, onDecodeSuccess)),
}

/**
 * STEP 2. json 型チェック でのエラー
 */
export class RTTLoaderDecodeError extends RTTLoaderError {
  name = 'RTTLoaderDecodeError'

  public readonly csvKind: CSVKind

  public readonly reports: CSVDecodeErrorReportType[]

  public readonly rowIdToNumber: RowIdToNumberType

  constructor(
    csvKind: CSVKind,
    userMessage: string,
    decodeErrors: t.Errors,
    rowIdToNumber: RowIdToNumberType,
  ) {
    super(`${userMessage}\nファイル: ${csvKind}.csv`)
    Object.setPrototypeOf(this, RTTLoaderDecodeError.prototype)

    this.csvKind = csvKind
    this.reports = CSVDecodeErrorReporter.report(left(decodeErrors))
    this.rowIdToNumber = rowIdToNumber
  }

  public toKGExceptions(): KGExceptionType[] {
    return this.reports.map((report) => ({
      exceptionName: this.name,
      userMessage: `${report.message}\nファイル: ${this.csvKind}.csv, 行: ${
        this.rowIdToNumber[report.rowId]
      }, 列: ${report.colName}`,
      debugMessage: '',
    }))
  }
}
