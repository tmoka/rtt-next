import { AdditionalStage, additionalStages } from './additionalStages'
import { PartialRecord } from './common'

/**
 * 現場idの型。
 * idはrailsのmodelで使用されているものと同じ。
 */
export type GenbaIdType = number

/**
 * アプリケーション内で現場を一意に識別するためのkey。
 * rtt_drawer, rtt_gfu (web) では id の `GENBA_KEY_LENGTH` 桁で0埋め、
 * rtt_app (electron) ではディレクトリのフルパスを使用する。
 */
export type GenbaKeyType = string

/**
 * `GenbaKeyType` の桁数
 */
export const GENBA_KEY_LENGTH = 4

/**
 * 1つの現場を表すデータの型
 */
export type GenbaType = {
  readonly rttwebGenba: RTTWebGenbaType | null
  readonly genbaData: GenbaDataType | null
  readonly errors: KGExceptionType[] | null
}

/**
 * rails の model から受け取ったデータの型
 */
export type RTTWebGenbaType = {
  readonly id: number
  readonly kana: string
  readonly motouke: string | null
  readonly name: string
}

/**
 * RTTWebGenbaType のデフォルト値
 */
export const defaultRTTWebGenba: RTTWebGenbaType = {
  id: 0,
  kana: '',
  motouke: null,
  name: '(無題)',
}

/**
 * newclass の GanbaData に対応する型
 */
export type GenbaDataType = {
  readonly format: GenbaFormat
  readonly heimenList: HeimenListType
  readonly zentai: ZentaiType
  readonly torishinNames: TorishinNamesType
}

/**
 * GenbaData が記録されていたファイルの形式を表すための型
 */
export enum GenbaFormat {
  OLD_GENBA = 'OLD_GENBA',
  CSV = 'CSV',
}

/**
 * 平面一覧を表すデータの型
 */
export type HeimenListType = {
  readonly [setsuName: string]: HeimenType
}

/**
 * 節名の型
 */
export type SetsuNameType = string

/**
 * newclass の HeimenData に対応する型。
 * 1つの節（平面）を表す。
 */
export type HeimenType = Zumen2dType

/**
 * ２つの節 (平面) を表すデータの型
 * 節比較で使う。
 */
export type TwoHeimensType = {
  readonly heimenSrc: HeimenType
  readonly heimenDst: HeimenType
}

/**
 * 平面, 立面を表すデータの型
 */
export type Zumen2dType = {
  readonly points: PointsType
  readonly links: LinkType[]
}

/**
 * 外壁を表すデータの型
 */
export type GaihekiType = {
  readonly points: PointsType
  readonly links: LinkType[]
}

/**
 * ステージを表す型
 */
export const BasicStage = {
  KIH: 'KIH',
  TAT: 'TAT',
  HON: 'HON',
  YOU: 'YOU',
  CON: 'CON',
} as const
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type BasicStage = typeof BasicStage[keyof typeof BasicStage]

export const StageLatest = 'LATEST'
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type StageLatest = typeof StageLatest

export type Stage = BasicStage | AdditionalStage | StageLatest

/**
 * ステージの順序
 */
export const STAGE_ORDER: Stage[] = [
  BasicStage.KIH,
  BasicStage.TAT,
  BasicStage.HON,
  BasicStage.YOU,
  BasicStage.CON,
  ...additionalStages,
  StageLatest,
]

/**
 * ある平面が各ステージのデータを持つかどうかを表す型。
 */
export type HeimenStagesType = {
  readonly [BasicStage.KIH]: boolean
  readonly [BasicStage.TAT]: boolean
  readonly [BasicStage.HON]: boolean
  readonly [BasicStage.YOU]: boolean
  readonly [BasicStage.CON]: boolean
}

/**
 * ポイント一覧を表すデータの型
 */
export type PointsType = {
  readonly [key: string]: KGPointType
}

/**
 * ポイント名の型。
 * 所属するX方向, Y方向の通り芯名を組み合わせて、 `<X方向通り芯名>-<Y方向通り芯名>` のような名前が指定されることが多い。
 */
export type PointNameType = string

/**
 * 現場内でポイントを一意に識別するkeyの型
 */
export type PointKeyType = string

/**
 * newclass の KGPoint に対応する型
 */
export type KGPointType = {
  readonly name: PointNameType
  readonly xTorishinName?: string
  readonly yTorishinName?: string
  readonly setsuName: SetsuNameType
  readonly colForm: ColForm
  readonly angle?: number
  readonly x: number
  readonly y: number
  readonly z: number
  readonly gosaVectors: GosaVectorsType
  readonly latestStage: Stage
  readonly comment?: string
}

/**
 * KIH から各ステージへの誤差を表すデータの型
 */
export type GosaVectorsType = PartialRecord<Stage, GosaVectorType>

/**
 * KIH からあるステージへの誤差を表すデータの型
 */
export type GosaVectorType = {
  readonly x: number
  readonly y: number
  readonly z: number
}

/**
 * newclass の Link に対応する型。
 * 結線の両端の点が記録されている。
 */
export type LinkType = [PointNameType, PointNameType]

/**
 * newclass の ZentaiManager に対応する型
 */
export type ZentaiType = {
  readonly setsuList: SetsuListType
  readonly torishinList: TorishinListType
  readonly gaihekiTorishin: GaihekiTorishinType
}

/**
 * newclass の RTTekkotsuSetsuList に対応する型。
 * ZENTAIZ ファイルの内容に対応。各節のz座標の値が記録されている。
 */
export type SetsuListType = {
  readonly [setsuName: string]: SetsuZValueType | undefined
}

/**
 * 節のz座標の型
 */
export type SetsuZValueType = number

/**
 * newclass の RTTekkotsuTorishinList に対応する型。
 * ZENTAIX, ZENTAIY ファイルに対応。X方向, Y方向それぞれの通り芯の一覧。
 */
export type TorishinListType = {
  readonly [torishinName: string]: TorishinType | undefined
}

/**
 * 通り芯名の型
 */
export type TorishinNameType = string

/**
 * newclass の Torishin に対応する型。
 * 指定された2点を通る直線が通り芯となる。
 */
export type TorishinType = [{ x: number; y: number }, { x: number; y: number }]

/**
 * GaihekiType の key の型
 */
export enum GaihekiKey {
  X_M = 'x-', // X方向の1つめの通り芯を表すkey
  X_P = 'x+', // X方向の2つめの通り芯を表すkey
  Y_M = 'y-', // Y方向の1つめの通り芯を表すkey
  Y_P = 'y+', // Y方向の2つめの通り芯を表すkey
}

/**
 * ある値が GAIHEKI_KEY 型かどうかを判断する
 * @param val - GAIHEKI_KEY かどうかを判断したい値
 */
export const isGaihekiKey = (val: string): val is GaihekiKey =>
  (Object.values(GaihekiKey) as string[]).includes(val)

/**
 * GAIHEKIファイルのデータに対応する型。
 * X方向, Y方向の外壁となる通り芯が記録されている。
 */
export type GaihekiTorishinType = {
  readonly [K in GaihekiKey]?: TorishinNameType
}

/**
 * 通り芯名の一覧を表す型
 */
export type TorishinNamesType = {
  readonly x: TorishinNameType[]
  readonly y: TorishinNameType[]
}

/**
 * newclass の例外を json 化したデータの型
 */
export type KGExceptionType = {
  /**
   * 例外名
   */
  readonly exceptionName: string

  /**
   * ユーザ向けメッセージ
   */
  readonly userMessage: string

  /**
   * デバッグ用メッセージ
   */
  readonly debugMessage: string
}

/**
 * KGExceptionType のデフォルト値
 */
export const defaultKGException = {
  exceptionName: 'Error',
  userMessage: '不明なエラーが発生しました。',
  debugMessage: '',
}

/**
 * GenbaType の初期値
 */
export const defaultGenba: GenbaType = {
  rttwebGenba: defaultRTTWebGenba,
  genbaData: null,
  errors: [],
}

/**
 * 柱形状を表す型
 */
export enum ColForm {
  H = 'H',
  I = 'I',
  C = 'C',
  S = 'S',
  PLS = '+',
  T_U = 'T_U',
  T_D = 'T_D',
  T_L = 'T_L',
  T_R = 'T_R',
  X = 'X',
  I_L = 'I_L',
  I_R = 'I_R',
  D = 'D',
  DOT = 'DOT',
}

export const defaultColForm = ColForm.S

/**
 * ある値が COL_FORM 型かどうかを判断する
 * @param val - COL_FORM かどうかを判断したい値
 */
export const isColForm = (val: string): val is ColForm =>
  (Object.values(ColForm) as string[]).includes(val)
