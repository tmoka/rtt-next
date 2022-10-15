import { parse, unparse, ParseConfig, ParseResult, ParseError } from 'papaparse'
import * as t from 'io-ts'
import { fold } from 'fp-ts/lib/Either'
import humps from 'humps'
import {
  CSVLinkRuntype,
  CSVLinkRow,
  CSVPointRuntype,
  CSVPointRow,
  CSVSetsuRuntype,
  CSVSetsuRow,
  CSVTorishinRuntype,
  CSVTorishinRow,
  GenbaType,
  GenbaDataType,
  GenbaFormat,
} from '../../common/types'
import { range } from '../../common/utils'
import {
  getTorishinNames,
  getZentai,
  getHeimenList,
  emptyGenbaWithUnknownError,
  splitByLine,
} from './utils'
import {
  CSVKind,
  RowIdToNumberType,
  RTTLoaderParseError,
  RTTLoaderDecodeError,
  RTTLoaderError,
} from './errors'

/**
 * RTTLoaderが受け取る入力の型
 */
export type LoaderContentType = string

/**
 * papaparse の実行結果の型
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LoaderParseResult = ParseResult<any>

/**
 * RTTLoaderが受け取る入力の型を1現場分まとめた型
 */
export type LoaderAllContentType = {
  readonly [K in CSVKind]: LoaderContentType
}

/**
 * 型チェック済みのjsonの型を1現場分まとめた型
 */
export type AllCsvRowsType = {
  linkRows: CSVLinkRow[]
  pointRows: CSVPointRow[]
  setsuRows: CSVSetsuRow[]
  torishinRows: CSVTorishinRow[]
}

/**
 * csvデータ読み込み用クラス。
 * 読み込み処理は3段階で構成される。
 * STEP 1. csv -> json 変換
 * STEP 2. json 型チェック
 * STEP 3. json -> GenbaData 変換
 */
export class RTTLoader {
  /** papaparseに渡すconfig */
  private config: ParseConfig

  constructor(config: ParseConfig = {}) {
    this.config = {
      ...config,
      // 列の区切りの文字列
      delimiter: ',',
      // 1行目をcsvヘッダとして読み込む
      header: true,
      // ヘッダをキャメルケースに変換する
      transformHeader: humps.camelize,
      // `#` から始まる行はコメントとして読み飛ばす
      comments: '#',
      // csv -> json 変換の段階では全てのセルを文字列として扱う
      dynamicTyping: false,
      // 空行を読み飛ばす
      skipEmptyLines: true,
    }
  }

  /**
   * rowId と rowNumber の対応を表すデータを返す
   * ただし、
   *  - rowId ... csv のコメント行を除いたうえでの0始まりの行番号（= papaparse や io-ts が返す行番号）
   *  - rowNumber ... csv のコメントを含めた1始まりの行番号（= ユーザ表示向けの行番号）
   * である
   * @param content - csvファイルの内容
   * @return rowId と rowNumber の対応を表す配列
   */
  private getRowIdToNumber(content: LoaderContentType): RowIdToNumberType {
    const lines = splitByLine(content)
    if (!this.config.comments) {
      // コメント行を利用しない設定になっているとき
      // 単純に0始まりを1始まりに直して1行目のヘッダの分を除くだけでok
      return range(2, lines.length + 2)
    }
    const commentsPrefix = this.config.comments === true ? '#' : this.config.comments
    const commentRegexp = new RegExp(`^${commentsPrefix}`)
    const rowIdToNumber: number[] = []
    lines.forEach((line, i) => {
      if (
        i !== 0 && // 1行目のヘッダ行ではない
        !commentRegexp.test(line) && // コメント行ではない
        !(this.config.skipEmptyLines && line === '') // 空行ではない
      ) {
        rowIdToNumber.push(i + 1)
      }
    })
    return rowIdToNumber
  }

  /**
   * STEP 1. csv -> json 変換 を行う
   * @param content - csvファイルの内容
   * @returns papaparse の実行結果
   */
  private asyncParse(content: LoaderContentType): Promise<LoaderParseResult> {
    return new Promise<LoaderParseResult>((resolve, reject) => {
      const onComplete = (results: LoaderParseResult): void => {
        resolve(results)
      }
      const onError = (error: ParseError): void => {
        reject(error)
      }
      const conf: ParseConfig = {
        ...this.config,
        complete: onComplete,
        error: onError,
      }
      try {
        parse(content, conf)
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 1つのcsvファイルを読み込んで実行時の型チェック済みのjsonを返す
   * @param csvKind
   * @param content - csvファイル
   * @param csvRuntype - 出来上がるjsonのruntype
   * @returns 実行時の型チェック済みの json
   */
  private async loadOne<R extends t.Any>(
    csvKind: CSVKind,
    content: LoaderContentType,
    csvRuntype: R,
  ): Promise<t.TypeOf<R>> {
    const rowIdToNumber = this.getRowIdToNumber(content)

    // STEP 1. csv -> json 変換
    const parseResults = await this.asyncParse(content)
    if (parseResults.errors.length > 0) {
      throw new RTTLoaderParseError(
        csvKind,
        'csvファイルが不正です。',
        parseResults.errors,
        rowIdToNumber,
      )
    }

    // STEP 2. json 型チェック
    const decResult = csvRuntype.decode(parseResults.data)
    const decodedData: t.TypeOf<R> = fold(
      // 失敗時に実行する処理
      (errors: t.Errors) => {
        throw new RTTLoaderDecodeError(
          csvKind,
          'csvファイルのデータの型が不正です。',
          errors,
          rowIdToNumber,
        )
      },
      // 成功時に実行する処理
      (data) => data,
    )(decResult)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return decodedData
  }

  /**
   * link.csv を読み込む
   */
  public loadLink(content: LoaderContentType): Promise<CSVLinkRow[]> {
    return this.loadOne(CSVKind.LINK, content, CSVLinkRuntype)
  }

  /**
   * point.csv を読み込む
   */
  public loadPoint(content: LoaderContentType): Promise<CSVPointRow[]> {
    return this.loadOne(CSVKind.POINT, content, CSVPointRuntype)
  }

  /**
   * setsu.csv を読み込む
   */
  public loadSetsu(content: LoaderContentType): Promise<CSVSetsuRow[]> {
    return this.loadOne(CSVKind.SETSU, content, CSVSetsuRuntype)
  }

  /**
   * torishin.csv を読み込む
   */
  public loadTorishin(content: LoaderContentType): Promise<CSVTorishinRow[]> {
    return this.loadOne(CSVKind.TORISHIN, content, CSVTorishinRuntype)
  }

  /**
   * 最初の2ステップの処理を行う
   * STEP 1. csv -> json 変換
   * STEP 2. json 型チェック
   */
  private async parseAndDecode(allContent: LoaderAllContentType): Promise<AllCsvRowsType> {
    const [linkRows, pointRows, setsuRows, torishinRows] = await Promise.all([
      this.loadLink(allContent.link),
      this.loadPoint(allContent.point),
      this.loadSetsu(allContent.setsu),
      this.loadTorishin(allContent.torishin),
    ])
    return { linkRows, pointRows, setsuRows, torishinRows }
  }

  /**
   * 3ステップ目の処理を行う
   * STEP 3. json -> GenbaData 変換
   */
  public static convert(allCsvRows: AllCsvRowsType, format: GenbaFormat): GenbaType {
    const { linkRows, pointRows, setsuRows, torishinRows } = allCsvRows

    const zentai = getZentai(setsuRows, torishinRows)
    const heimenList = getHeimenList(pointRows, linkRows, zentai.setsuList)
    const torishinNames = getTorishinNames(heimenList)

    const genbaData: GenbaDataType = {
      format,
      heimenList,
      zentai,
      torishinNames,
    }
    const genba = {
      rttwebGenba: null,
      genbaData,
      errors: [],
    }
    return genba
  }

  /**
   * csvファイルを読み込んで GenbaData を返す
   * @param linkContent - link.csv の内容
   * @param pointContent - point.csv の内容
   * @param setsuContent - setsu.csv の内容
   * @param torishinContent - torishin.csv の内容
   * @returns 実行時のjson型チェック済みの GenbaData
   */
  public async loadGenba(
    allContent: LoaderAllContentType,
    format: GenbaFormat,
  ): Promise<GenbaType> {
    try {
      // STEP 1. csv -> json 変換
      // STEP 2. json 型チェック
      const allCsvRows = await this.parseAndDecode(allContent)

      // STEP 3. json -> GenbaData 変換
      const genba = RTTLoader.convert(allCsvRows, format)

      return genba
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      const genba =
        err instanceof RTTLoaderError
          ? {
              rttwebGenba: null,
              genbaData: null,
              errors: err.toKGExceptions(),
            }
          : emptyGenbaWithUnknownError
      return genba
    }
  }
}

/**
 * csv の行データを csv 形式の文字列に変換する
 */
export const unparseRows = (
  rows: CSVLinkRow[] | CSVPointRow[] | CSVSetsuRow[] | CSVTorishinRow[],
): string => {
  return unparse(humps.decamelizeKeys(rows))
}
