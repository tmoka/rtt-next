import { applyToPoint, rotateDEG } from 'transformation-matrix'
import {
  AXIS,
  BasicStage,
  GosaVectorType,
  KGPointType,
  PointKeyType,
  PointNameType,
  SetsuNameType,
  Stage,
  TorishinType,
} from '../../common/types'
import { XOrY, XYPointObject, ZUMEN, ZUMEN_TYPE_TO_AS_XYZ } from '../constants'
import { getAngle } from './common'

/**
 * 各ステージの柱を描画すべき座標を計算する
 * @param point
 * @param stage
 * @param gosaScale
 * @param zumenType
 * @returns
 */
export const getStageXY = (
  point: KGPointType,
  stage: Stage,
  gosaScale: number,
  zumenType:
    | ZUMEN.HEIMEN
    | ZUMEN.RITSUMEN1
    | ZUMEN.RITSUMEN2
    | ZUMEN.GAIHEKI1
    | ZUMEN.GAIHEKI2
    | ZUMEN.SETSU_COMPARISON,
): XYPointObject => {
  const { asX, asY } = ZUMEN_TYPE_TO_AS_XYZ[zumenType]
  let x = point[asX]
  let y = point[asY]
  const gv = point.gosaVectors[stage]
  if (stage !== BasicStage.KIH && gv) {
    // TODO: gosaVectors に該当する stage の値がなかった場合のエラー処理
    x += gv[asX] * gosaScale
    y += gv[asY] * gosaScale
  }
  return { x, y }
}

/**
 * 指定したステージのgosaVectorを取得する
 * @param point
 * @param stage
 * @returns gosaVector。該当するステージのデータがなければundefined
 */
export const getGosaVector = (point: KGPointType, stage: Stage): GosaVectorType | undefined => {
  if (stage === BasicStage.KIH) {
    return { x: 0, y: 0, z: 0 }
  }
  return point.gosaVectors[stage]
}

/**
 * 比較元と比較先の誤差を計算する
 * @param point
 * @param src - 比較元ステージ
 * @param dst - 比較先ステージ
 * @returns gosaVector。該当するステージのデータがない場合、比較元と比較先ステージが同じ場合はnull。
 */
export const getGosaVectorDiff = (
  point: KGPointType,
  src: Stage,
  dst: Stage,
  zumenType: ZUMEN.HEIMEN | ZUMEN.RITSUMEN1 | ZUMEN.RITSUMEN2 | ZUMEN.SETSU_COMPARISON,
): GosaVectorType | null => {
  if (src === dst) {
    // 比較元と比較先ステージが同じ場合
    return null
  }
  const gvSrc = getGosaVector(point, src)
  const gvDst = getGosaVector(point, dst)
  if (!gvSrc || !gvDst) {
    // 該当するステージのデータがない場合
    return null
  }
  const deg = getAngle(zumenType, point)
  const rotatedXY = applyToPoint(rotateDEG(deg), {
    x: gvDst.x - gvSrc.x,
    y: gvDst.y - gvSrc.y,
  })
  return {
    x: rotatedXY.x,
    y: rotatedXY.y,
    z: gvDst.z - gvSrc.z,
  }
}

/**
 * 誤差値を表示用の文字列に変換する
 * @param gosa - 誤差
 * @param decimalDigits - 小数点以下何桁まで表示するか
 * @param isAbs - 絶対値で表示するか
 * @param isParens - 括弧付きで表示するか
 * @returns 表示用の文字列
 */
export const displayGosaValue = (
  gosa: number,
  decimalDigits: number,
  isAbs: boolean,
  isParens: boolean,
): string => {
  const gosaAbsDec = Math.abs(gosa).toFixed(decimalDigits)
  const gosaDec = gosa.toFixed(decimalDigits)
  const plus = gosa > 0 ? '+' : ''

  if (isAbs) {
    if (isParens) {
      return `(${gosaAbsDec})`
    }
    return `${gosaAbsDec}`
  }
  if (isParens) {
    return `(${plus}${gosaDec})`
  }
  return `${plus}${gosaDec}`
}

/**
 * `<ポイント名>#<節名>` を pointKey として使うことで、ポイントを一意に識別する。
 * 複数の節に同じポイント名のポイントが存在することがあるので、ポイント名だけでは
 * ポイントを一意に識別できない。結線を設定するときなどに不便である。
 */
export const POINT_SETSU_DELIMITER = '#'

/**
 * ポイント名と節名からポイントを一意に識別するkeyを取得する
 * @param pointName
 * @param setsuName
 * @returns ポイントkey
 */
const pointNameToPointKey = (pointName: PointNameType, setsuName: SetsuNameType): PointKeyType =>
  `${pointName}${POINT_SETSU_DELIMITER}${setsuName}`

/**
 * ポイントからポイントを一意に識別するkeyを取得する
 * @param point
 * @returns ポイントkey
 */
export const pointToKey = (point: KGPointType): PointKeyType =>
  pointNameToPointKey(point.name, point.setsuName)

/**
 * 線分の端点を表すデータの型
 */
export interface EndPointsType {
  x1: number
  y1: number
  x2: number
  y2: number
}

/**
 * 通り芯の端点の座標を取得する
 * @param - torishin
 * @param - zumenType
 * @returns 2点の座標。ただし、 `zumenType` が平面以外でかつ `torishin` が斜めになっている場合
 * （ = 通り芯を描画する必要がない場合）はnullを返す。
 */
export const getTorishinEndPoints = (
  torishin: TorishinType,
  zumenType:
    | ZUMEN.HEIMEN
    | ZUMEN.RITSUMEN1
    | ZUMEN.RITSUMEN2
    | ZUMEN.GAIHEKI1
    | ZUMEN.GAIHEKI2
    | ZUMEN.SETSU_COMPARISON,
): EndPointsType | null => {
  const { asX, asY } = ZUMEN_TYPE_TO_AS_XYZ[zumenType]
  if (asX === AXIS.Z) {
    // 通り芯の端点のz座標は意味無し
    return null
  }
  const [point1, point2] = torishin
  const [x1, x2] = [point1[asX], point2[asX]]
  const zumenHeimenOrSetsuComparison =
    zumenType === ZUMEN.HEIMEN || zumenType === ZUMEN.SETSU_COMPARISON
  if (!zumenHeimenOrSetsuComparison && x1 !== x2) {
    // 平面以外では斜め通り芯を描画しない
    return null
  }
  const [y1, y2] =
    zumenHeimenOrSetsuComparison && asY !== AXIS.Z ? [point1[asY], point2[asY]] : [0, 1]

  return {
    x1,
    y1,
    x2,
    y2,
  }
}

export const toXYKey = (xy: XOrY): AXIS => {
  switch (xy) {
    case XOrY.X:
      return AXIS.X
    case XOrY.Y:
      return AXIS.Y
    default:
      throw new Error('描画エラーが発生しました。')
  }
}

/**
 * あるイベントがSVG内で起こったかどうか調べる
 */
export const isInsideSVG = (
  event: MouseEvent | TouchEvent,
  rootCoordRef: React.RefObject<SVGGElement> | null,
): boolean => {
  if (!rootCoordRef) {
    return false
  }
  const { current } = rootCoordRef
  if (!current) {
    return false
  }
  const targets = event.composedPath()
  return targets.includes(current)
}
