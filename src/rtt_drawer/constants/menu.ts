import {
  AXIS,
  BasicStage,
  GaihekiKey,
  SetsuNameType,
  Stage,
  TorishinNameType,
} from '../../common/types'

/**
 * 図面タイプの型
 */
export enum ZUMEN {
  HEIMEN = 'HEIMEN',
  SETSU_COMPARISON = 'SETSU_COMPARISON',
  RITSUMEN1 = 'RITSUMEN1',
  RITSUMEN2 = 'RITSUMEN2',
  GAIHEKI1 = 'GAIHEKI1',
  GAIHEKI2 = 'GAIHEKI2',
  SINGLE_COLUMN = 'SINGLE_COLUMN',
}

/**
 * 図面タイプと日本語名の対応
 */
export const ZUMEN_TO_JA = {
  [ZUMEN.HEIMEN]: '平面図',
  [ZUMEN.SETSU_COMPARISON]: '節比較',
  [ZUMEN.RITSUMEN1]: '立面図1',
  [ZUMEN.RITSUMEN2]: '立面図2',
  [ZUMEN.GAIHEKI1]: '外壁図1',
  [ZUMEN.GAIHEKI2]: '外壁図2',
  [ZUMEN.SINGLE_COLUMN]: '柱単品図',
}

/**
 * SVGとKGPointのxyz方向の対応を表す型
 */
export interface AsXYZType {
  readonly asX: AXIS
  readonly asY: AXIS
  readonly asZ?: AXIS
}

/**
 * KGPointの x, y, z のうちのいずれをSVGのx方向, y方向として用いるかを図面タイプごとに設定する定数。
 * 例えば、 `point[asX]` とすると、 KGPoint のデータからSVGのx方向として用いるべき座標値が取得できる。
 */
export const ZUMEN_TYPE_TO_AS_XYZ = {
  [ZUMEN.HEIMEN]: { asX: AXIS.X, asY: AXIS.Y, asZ: AXIS.Z },
  [ZUMEN.RITSUMEN1]: { asX: AXIS.Y, asY: AXIS.Z },
  [ZUMEN.RITSUMEN2]: { asX: AXIS.X, asY: AXIS.Z },
  [ZUMEN.GAIHEKI1]: { asX: AXIS.Y, asY: AXIS.Z, asZ: AXIS.X },
  [ZUMEN.GAIHEKI2]: { asX: AXIS.X, asY: AXIS.Z, asZ: AXIS.Y },
  [ZUMEN.SETSU_COMPARISON]: { asX: AXIS.X, asY: AXIS.Y, asZ: AXIS.Z },
}

/**
 * ZUMENのデフォルト値
 */
export const defaultZumenType = ZUMEN.HEIMEN

/**
 * メニューのスライドバーの値を一時的に保存するkeyのsuffix。
 * 例えば、 gosaValueFontSize のスライド中の値は gosaValueFontSizeTemp に保存される。
 */
export const TEMP_MENU_KEY_SUFFIX = 'Temp'

/**
 * メニューのスライドバーの値を一時的に保存するkeyにマッチする正規表現
 */
export const tempMenuConfigKeyRegExp = new RegExp(`${TEMP_MENU_KEY_SUFFIX}$`)

/**
 * 誤差の表示方法を表す型
 */
export enum GosaDisplayType {
  VECTOR = 'VECTOR',
  TABLE = 'TABLE',
}

/**
 * 誤差の表示方法と日本語名の対応
 */
export const GOSA_DISPLAY_TYPE_TO_JA = {
  [GosaDisplayType.VECTOR]: '矢印',
  [GosaDisplayType.TABLE]: 'テーブル',
}

/**
 * RangeMenuConfigType の key の型
 */
type RangeMenuConfigKeyType =
  | 'gosaValueFontSize'
  | 'gosaValueFontSizeTemp'
  | 'gosaArrowSize'
  | 'gosaArrowSizeTemp'
  | 'torishinSize'
  | 'torishinSizeTemp'
  | 'gosaScale'
  | 'gosaScaleTemp'
  | 'columnSize'
  | 'columnSizeTemp'
  | 'decimalDigits'
  | 'decimalDigitsTemp'

/**
 * メニューのうちのスライドバーの値を表すデータの型
 */
type RangeMenuConfigType = { readonly [K in RangeMenuConfigKeyType]: number }

/**
 * RangeMenuConfigType のデフォルト値
 */
const defaultRangeMenuConfig: RangeMenuConfigType = {
  gosaValueFontSize: 16,
  gosaValueFontSizeTemp: 16,
  gosaArrowSize: 10,
  gosaArrowSizeTemp: 10,
  torishinSize: 18,
  torishinSizeTemp: 18,
  gosaScale: 100,
  gosaScaleTemp: 100,
  columnSize: 10,
  columnSizeTemp: 10,
  decimalDigits: 0,
  decimalDigitsTemp: 0,
}

/**
 * メニューの値を表すデータの型
 */
export interface MenuConfigType extends RangeMenuConfigType {
  /** MenuConfigのハッシュ値。MenuConfigの値の変化の検知に使用する。 */
  readonly hash: string

  /** 選択中の節, 通り */
  readonly heimenSetsuName: SetsuNameType
  readonly ritsumen1XToriName: TorishinNameType
  readonly ritsumen2YToriName: TorishinNameType
  readonly gaiheki1XKey: GaihekiKey | null
  readonly gaiheki2YKey: GaihekiKey | null
  readonly singleColumnXToriName: TorishinNameType
  readonly singleColumnYToriName: TorishinNameType

  /** 比較元, 比較先の節 */
  readonly setsuComparisonSrcName: SetsuNameType
  readonly setsuComparisonDstName: SetsuNameType

  /** 比較元, 比較先ステージ */
  readonly isShowAdditionalStages: boolean
  readonly stageSrc: Stage
  readonly stagesDstRaw: Stage[]
  readonly stagesDst: Stage[]

  /** 誤差の表示方法 */
  readonly gosaDisplayType: GosaDisplayType

  /** チェックボックスの設定値 */
  readonly isShowColumnAll: boolean
  readonly isShowColumnStageSrc: boolean
  readonly isShowColumnStageDst: boolean
  readonly isShowGosaValues: boolean
  readonly isShowGosaArrows: boolean
  readonly isShowLinks: boolean
  readonly isInfinityLink: boolean
  readonly isShowSetsuZValues: boolean
  readonly isShowGosaKanriAndGosaGenkai: boolean
}

/**
 * MenuConfigType のデフォルト値
 */
export const defaultMenuConfig: MenuConfigType = {
  hash: '',

  heimenSetsuName: '',
  ritsumen1XToriName: '',
  ritsumen2YToriName: '',
  gaiheki1XKey: null,
  gaiheki2YKey: null,
  singleColumnXToriName: '',
  singleColumnYToriName: '',

  setsuComparisonSrcName: '',
  setsuComparisonDstName: '',

  isShowAdditionalStages: false,
  stageSrc: BasicStage.KIH,
  stagesDstRaw: [BasicStage.KIH],
  stagesDst: [],

  gosaDisplayType: GosaDisplayType.VECTOR,

  isShowColumnAll: false,
  isShowColumnStageSrc: true,
  isShowColumnStageDst: true,
  isShowGosaValues: true,
  isShowGosaArrows: true,
  isShowLinks: true,
  isInfinityLink: true,
  isShowSetsuZValues: true,
  isShowGosaKanriAndGosaGenkai: false,

  // range inputs
  ...defaultRangeMenuConfig,
}
