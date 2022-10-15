/**
 * csv読み込み用の実行時の型に関するファイル。
 *
 * 通常のtypescriptの型はコンパイル時にしかチェックされず、実行時には特にチェックがないので、
 * ユーザが入力したcsvから読み込んだデータの型がtypescriptの型と合わない、ということがあり得る。
 * そこで、 io-ts を用いて runtype (=実行時の型) を定義する。
 * csvから読み込んだデータをruntypeと照合することで、ユーザが入力したデータが正しいかどうかをある程度確認できる。
 * もし不整合がある場合は、どこが間違っているかをユーザに示すことができる。
 */

import * as t from 'io-ts'
import { either } from 'fp-ts/lib/Either'
import { additionalStageColumnKeys, AdditionalStageColumnKey } from './additionalStages'

/**
 * 文字列(必須) のセル用のruntype。
 * - 列自体が存在しない => エラー
 * - セルが空 => 空文字列
 * - その他 => そのままの文字列
 */
export const CSVStringRuntype = new t.Type<string, string>(
  'CSVString',
  t.string.is,
  (u, c) => {
    if (u === '') {
      // 空文字列はエラー扱いする
      return t.failure(u, c)
    }
    return t.string.validate(u, c)
  },
  t.identity,
)

/**
 * 文字列(任意) のセル用のruntype。
 * - 列自体が存在しない => undefined
 * - セルが空 => undefined
 * - その他 => そのままの文字列
 */
export const CSVOptionalStringRuntype = new t.Type<string | undefined, string | undefined>(
  'CSVOptionalString',
  (u): u is string | undefined => typeof u === 'string' || u === undefined,
  (u, c) => {
    if (u === undefined || u === '') {
      // 列自体が存在しない => undefined
      // セルが空 => undefined
      return t.success(undefined)
    }
    return t.string.validate(u, c)
  },
  (a) => (a === undefined ? '' : a),
)

/**
 * 数値(必須) のセル用のruntype。
 * - 列自体が存在しない => エラー
 * - セルが空 => エラー
 * - セルの中身の文字列が数値に変換できない文字列 => エラー
 * - その他 => セルの中身の文字列を数値に変換した値
 *
 * 参照: https://github.com/gcanti/io-ts/tree/2.0.0#custom-types
 */
export const CSVNumberRuntype = new t.Type<number, string>(
  'CSVNumber',
  t.number.is,
  (u, c) =>
    either.chain(t.string.validate(u, c), (s) => {
      if (s === '') {
        // セルが空 => エラー
        return t.failure(s, c)
      }
      const n = +s
      return Number.isNaN(n) ? t.failure(s, c) : t.success(n)
    }),
  String,
)

/**
 * 数値(任意) のセル用のruntype。
 * - 列自体が存在しない => undefined
 * - セルが空 => undefined
 * - セルの中身の文字列が数値に変換できない文字列 => エラー
 * - その他 => セルの中身の文字列を数値に変換した値
 *
 * 参照: https://github.com/gcanti/io-ts/tree/2.0.0#custom-types
 */
export const CSVOptionalNumberRuntype = new t.Type<number | undefined, string | undefined>(
  'CSVOptionalNumber',
  (u): u is number | undefined => typeof u === 'number' || u === undefined,
  (u, c) => {
    if (u === undefined) {
      // 列自体が存在しない => undefined
      return t.success(undefined)
    }
    return either.chain(t.string.validate(u, c), (s) => {
      if (s === '') {
        // セルが空 => undefined
        return t.success(undefined)
      }
      const n = +s
      return Number.isNaN(n) ? t.failure(s, c) : t.success(n)
    })
  },
  (a) => (a === undefined ? '' : String(a)),
)

/**
 * csv読み込み用の実行時の型の名前と日本語名の対応
 */
export const CSV_RUNTYPE_NAME_TO_JA = {
  [CSVStringRuntype.name]: '文字列 (必須)',
  [CSVOptionalStringRuntype.name]: '文字列 (任意)',
  [CSVNumberRuntype.name]: '数値 (必須)',
  [CSVOptionalNumberRuntype.name]: '数値 (任意)',
}

/**
 * link.csv の型。
 * 詳細は http://localhost:3000/documents/rttweb のドキュメント参照。
 * ここでの定義、ドキュメントの説明、csvテンプレートの内容が不整合を起こさないように注意する。
 */
export const CSVLinkRowRuntype = t.type({
  pointName1: CSVStringRuntype,
  pointName2: CSVStringRuntype,
  setsuName: CSVStringRuntype,
})
export const CSVLinkRuntype = t.array(CSVLinkRowRuntype)
export type CSVLinkRow = t.TypeOf<typeof CSVLinkRowRuntype>

const additionalStagesRuntypeObj = additionalStageColumnKeys.reduce(
  (acc, key) => ({ ...acc, [key]: CSVOptionalNumberRuntype }),
  {} as { [K in AdditionalStageColumnKey]: typeof CSVOptionalNumberRuntype },
)

/**
 * point.csv の型。
 * 詳細は http://localhost:3000/documents/rttweb のドキュメント参照。
 * ここでの定義、ドキュメントの説明、csvテンプレートの内容が不整合を起こさないように注意する。
 */
export const CSVPointRowRuntype = t.type({
  pointName: CSVStringRuntype,
  xTorishinName: CSVOptionalStringRuntype,
  yTorishinName: CSVOptionalStringRuntype,
  setsuName: CSVStringRuntype,
  colForm: CSVOptionalStringRuntype,
  angle: CSVOptionalNumberRuntype,
  kihX: CSVNumberRuntype,
  kihY: CSVNumberRuntype,
  kihZ: CSVNumberRuntype,
  tatX: CSVOptionalNumberRuntype,
  tatY: CSVOptionalNumberRuntype,
  tatZ: CSVOptionalNumberRuntype,
  honX: CSVOptionalNumberRuntype,
  honY: CSVOptionalNumberRuntype,
  honZ: CSVOptionalNumberRuntype,
  youX: CSVOptionalNumberRuntype,
  youY: CSVOptionalNumberRuntype,
  youZ: CSVOptionalNumberRuntype,
  conX: CSVOptionalNumberRuntype,
  conY: CSVOptionalNumberRuntype,
  conZ: CSVOptionalNumberRuntype,
  comment: CSVOptionalStringRuntype,
  // 追加ステージのデータ
  ...additionalStagesRuntypeObj,
})
export const CSVPointRuntype = t.array(CSVPointRowRuntype)
export type CSVPointRow = t.TypeOf<typeof CSVPointRowRuntype>

/**
 * setsu.csv の型。
 * 詳細は http://localhost:3000/documents/rttweb のドキュメント参照。
 * ここでの定義、ドキュメントの説明、csvテンプレートの内容が不整合を起こさないように注意する。
 */
export const CSVSetsuRowRuntype = t.type({
  setsuName: CSVStringRuntype,
  z: CSVNumberRuntype,
})
export const CSVSetsuRuntype = t.array(CSVSetsuRowRuntype)
export type CSVSetsuRow = t.TypeOf<typeof CSVSetsuRowRuntype>

/**
 * torishin.csv の型。
 * 詳細は http://localhost:3000/documents/rttweb のドキュメント参照。
 * ここでの定義、ドキュメントの説明、csvテンプレートの内容が不整合を起こさないように注意する。
 */
export const CSVTorishinRowRuntype = t.type({
  torishinName: CSVStringRuntype,
  x1: CSVNumberRuntype,
  y1: CSVNumberRuntype,
  x2: CSVNumberRuntype,
  y2: CSVNumberRuntype,
  gaihekiType: CSVOptionalStringRuntype,
})
export const CSVTorishinRuntype = t.array(CSVTorishinRowRuntype)
export type CSVTorishinRow = t.TypeOf<typeof CSVTorishinRowRuntype>

const defaultAdditionalStages = additionalStageColumnKeys.reduce(
  (acc, key) => ({ ...acc, [key]: undefined }),
  {} as { [K in AdditionalStageColumnKey]: undefined },
)

export const defaultCSVPoint: CSVPointRow = {
  pointName: '',
  xTorishinName: undefined,
  yTorishinName: undefined,
  setsuName: '0',
  colForm: undefined,
  angle: undefined,
  kihX: 0,
  kihY: 0,
  kihZ: 0,
  tatX: undefined,
  tatY: undefined,
  tatZ: undefined,
  honX: undefined,
  honY: undefined,
  honZ: undefined,
  youX: undefined,
  youY: undefined,
  youZ: undefined,
  conX: undefined,
  conY: undefined,
  conZ: undefined,
  comment: undefined,
  // 追加ステージのデフォルト値
  ...defaultAdditionalStages,
}

export type GosaKey =
  | 'tatX'
  | 'tatY'
  | 'tatZ'
  | 'honX'
  | 'honY'
  | 'honZ'
  | 'youX'
  | 'youY'
  | 'youZ'
  | 'conX'
  | 'conY'
  | 'conZ'
