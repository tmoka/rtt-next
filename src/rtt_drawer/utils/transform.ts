import { inverse, scale, translate, transform, Matrix } from 'transformation-matrix'
import { GenbaDataType } from '../../common/types'
import {
  MIN_ZOOM,
  MAX_ZOOM,
  MapState,
  initialMapState,
  XYPointObject,
  ZUMEN,
  ZUMEN_WIDTH,
  ZUMEN_HEIGHT,
  MenuConfigType,
} from '../constants'
import { selectMinMaxSetsuZ } from './common'
import { selectGaihekiRange } from './gaiheki'
import { selectZumen2dRange } from './zumen2d'

/**
 * MapState の zoom の値を倍率に変換する
 * @param zoom
 * @returns 倍率
 */
export const zoom2scale = (zoom: number): number => 2 ** zoom

/**
 * 倍率をMapState の zoom の値に変換する
 * @param scaleValue
 * @returns zoom値
 */
export const scale2zoom = (scaleValue: number): number => Math.log2(scaleValue)

/**
 * SVGの座標変換行列を2次元配列の形で表した型。
 * 以下のような配置になっている。
 *
 * ```js
 * [
 *   [a, c, e],
 *   [b, d, f]
 * ]
 * ```
 */
export type MatrixAsArray = [[number, number, number], [number, number, number]]

/**
 * MatrixAsArray を行列に変換する
 * @param arr
 * @returns 行列
 */
export const matFromArray = (arr: MatrixAsArray): Matrix => {
  const [[a, c, e], [b, d, f]] = arr
  return {
    a,
    b,
    c,
    d,
    e,
    f,
  }
}

/**
 * 座標変換行列から座標変換の倍率を求める。
 * 結構いい加減な求め方をしているので、もう少しちゃんとした方法があったら置き換えたい。
 * @param mat
 * @returns 倍率
 */
export const calcScaleFromTrans = (mat: Matrix): number => (Math.abs(mat.a) + Math.abs(mat.d)) / 2

/**
 * 描画領域設定
 */
export interface MapConfigType {
  width?: number // 描画領域の幅
  height?: number // 描画領域の高さ
  innerMinX?: number // 描画するデータに含まれるx座標の最小値
  innerMaxX?: number // 描画するデータに含まれるx座標の最大値
  innerMinY?: number // 描画するデータに含まれるy座標の最小値
  innerMaxY?: number // 描画するデータに含まれるy座標の最大値
  innerSpaceX?: number // 初期倍率のときに描画領域の内部x方向の余白
  innerSpaceY?: number // 初期倍率のときに描画領域の内部y方向の余白
  axisWidth?: number
  axisHeight?: number
  shearHeight?: number
  shearDegree?: number
}

/**
 * MapState と描画の座標変換の同期設定。
 * `xFixed`, `yFixed` はどちらかの軸を固定したい場合に必要。
 * `innerTranslateX`, `innterTranslateY`, `innterScale` は、
 * 現場ごとのサイズや位置の違いを吸収して見やすい位置・倍率で描画するために必要。
 */
export interface SyncConfigType {
  xFixed?: boolean // x方向の移動を固定するかどうか
  yFixed?: boolean // y方向の移動を固定するかどうか
  innerTranslateX: number // x方向にずらすべき量
  innerTranslateY: number // y方向にずらすべき量
  innerScale: number // かけるべき倍率
}

/**
 * 描画領域設定を計算する
 * @param genbaData
 * @param zumenType
 * @param menuConfig
 */
export const calcMapConfig = (
  genbaData: GenbaDataType | null,
  zumenType: ZUMEN,
  menuConfig: MenuConfigType,
): MapConfigType | null => {
  if (!genbaData) {
    return null
  }

  const { torishinSize } = menuConfig

  switch (zumenType) {
    case ZUMEN.HEIMEN:
    case ZUMEN.RITSUMEN1:
    case ZUMEN.RITSUMEN2:
    case ZUMEN.SETSU_COMPARISON: {
      const axisWidth =
        zumenType === ZUMEN.HEIMEN || zumenType === ZUMEN.SETSU_COMPARISON
          ? (torishinSize + 1) * 2
          : 100
      const axisHeight = (torishinSize + 1) * 2

      const { minX, maxX, minY, maxY } = selectZumen2dRange(genbaData, zumenType)

      const mapConfig = {
        width: ZUMEN_WIDTH - axisWidth,
        height: ZUMEN_HEIGHT - axisHeight,
        innerMinX: minX,
        innerMaxX: maxX,
        innerMinY: minY,
        innerMaxY: maxY,
        axisWidth,
        axisHeight,
      }
      return mapConfig
    }
    case ZUMEN.SINGLE_COLUMN: {
      const axisHeight = (torishinSize + 1) * 2

      const { setsuList } = genbaData.zentai
      const [minSetsuZ, maxSetsuZ] = selectMinMaxSetsuZ(setsuList)

      const mapConfig = {
        height: ZUMEN_HEIGHT - axisHeight,
        innerMinY: minSetsuZ,
        innerMaxY: maxSetsuZ,
        axisHeight,
      }
      return mapConfig
    }
    case ZUMEN.GAIHEKI1: {
      const axisWidth = 100
      const axisHeight = (torishinSize + 1) * 2
      const shearHeight = 200
      const shearDegree = 15

      const { minX, maxX, minY, maxY } = selectGaihekiRange(genbaData, zumenType)

      const mapConfig = {
        width: ZUMEN_WIDTH,
        height: ZUMEN_HEIGHT - shearHeight,
        innerMinX: minX,
        innerMaxX: maxX,
        innerMinY: minY,
        innerMaxY: maxY,
        axisWidth,
        axisHeight,
        shearHeight,
        shearDegree,
      }
      return mapConfig
    }
    case ZUMEN.GAIHEKI2: {
      const axisWidth = 100
      const axisHeight = (torishinSize + 1) * 2
      const shearHeight = 75
      const shearDegree = 30

      const { minX, maxX, minY, maxY } = selectGaihekiRange(genbaData, zumenType)

      const mapConfig = {
        width: ZUMEN_WIDTH - shearHeight - axisWidth,
        height: ZUMEN_HEIGHT - shearHeight - axisWidth,
        innerMinX: minX,
        innerMaxX: maxX,
        innerMinY: minY,
        innerMaxY: maxY,
        axisWidth,
        axisHeight,
        shearHeight,
        shearDegree,
      }
      return mapConfig
    }
    default:
      return null
  }
}

/**
 * 描画領域設定からその現場を描画がするのに適切なずらし量と倍率を計算する。
 * 現場ごとのサイズや位置の違いを吸収して見やすい位置・倍率で描画するために必要。
 * @param mapConfig - 描画領域設定
 * @returns 計算後のずらし量と倍率
 */
export const calcInnerTranslateAndScale = (mapConfig: MapConfigType): SyncConfigType => {
  const {
    width = 0,
    height = 0,
    innerMinX = 0,
    innerMaxX = 0,
    innerMinY = 0,
    innerMaxY = 0,
  } = mapConfig
  let { innerSpaceX, innerSpaceY } = mapConfig
  if (innerSpaceX === undefined) {
    innerSpaceX = width * 0.1 // デフォルトで左右10%を余白とする
  }
  if (innerSpaceY === undefined) {
    innerSpaceY = height * 0.1 // デフォルトで上下10%を余白とする
  }
  const hasXConfig = width && innerMaxX - innerMinX
  const hasYConfig = height && innerMaxY - innerMinY

  const innerScale = Math.min(
    hasXConfig ? (width - innerSpaceX * 2) / (innerMaxX - innerMinX) : 1,
    hasYConfig ? (height - innerSpaceY * 2) / (innerMaxY - innerMinY) : 1,
  )

  const innerTranslateX = hasXConfig ? width / 2 - ((innerMaxX + innerMinX) / 2) * innerScale : 0

  const innerTranslateY = hasYConfig ? height / 2 - ((innerMaxY + innerMinY) / 2) * innerScale : 0

  return { innerTranslateX, innerTranslateY, innerScale }
}

/**
 * マウス（もしくはタッチ）位置を中心にズーム後の mapState を計算する
 * @param currentXY - ズームの中心の座標
 * @param zoomDiff - zoomの変化量
 * @param mapState - 現在のmapState
 * @param innerScale
 * @returns ズーム後の mapState。これ以上拡大/縮小できないときはnullを返す。
 */
export const calcZoomAround = (
  currentXY: XYPointObject,
  zoomDiff: number,
  mapState: MapState,
  innerScale: number,
): MapState | null => {
  const { rootOffset, zoom } = mapState
  if ((zoom === MIN_ZOOM && zoomDiff < 0) || (zoom === MAX_ZOOM && zoomDiff > 0)) {
    return null
  }

  const nextZoom = Math.max(Math.min(zoom + zoomDiff, MAX_ZOOM), MIN_ZOOM)
  const ds = (zoom2scale(nextZoom) - zoom2scale(zoom)) * innerScale

  const x = rootOffset.x - ds * currentXY.x
  const y = rootOffset.y - ds * currentXY.y

  return { rootOffset: { x, y }, zoom: nextZoom }
}

/**
 * MapState と SyncConfig から座標変換行列を計算する
 * @param mapState
 * @param syncConfig
 * @returns
 */
export const syncWithMapTrans = (
  mapState: MapState | undefined,
  syncConfig: SyncConfigType,
): Matrix => {
  const { rootOffset, zoom } = mapState || initialMapState
  const { xFixed, yFixed, innerTranslateX, innerTranslateY, innerScale } = syncConfig
  const scaleValue = zoom2scale(zoom) * innerScale

  const transformMat = transform(
    translate(
      xFixed ? 0 : rootOffset.x + innerTranslateX,
      yFixed ? 0 : rootOffset.y + innerTranslateY,
    ),
    scale(xFixed ? 1 : scaleValue, yFixed ? 1 : scaleValue),
  )
  return transformMat
}

/**
 * MapState と SyncConfig から座標変換行列を計算する。
 * ただし、x方向を固定する。
 * @param mapState
 * @param syncConfig
 * @returns
 */
export const syncWithMapXFixedTrans = (
  mapState: MapState | undefined,
  syncConfig: SyncConfigType,
): Matrix => syncWithMapTrans(mapState, { ...syncConfig, xFixed: true })

/**
 * MapState と SyncConfig から座標変換行列を計算する。
 * ただし、y方向を固定する。
 * @param mapState
 * @param syncConfig
 * @returns
 */
export const syncWithMapYFixedTrans = (
  mapState: MapState | undefined,
  syncConfig: SyncConfigType,
): Matrix => syncWithMapTrans(mapState, { ...syncConfig, yFixed: true })

/**
 * 親コンポーネントのclearTransから子コンポーネントのclearTransを計算する。
 * @param nextTrans - 親コンポーネントから子コンポーネントへの座標変換行列
 * @param currentClearTrans - 親コンポーネントのclearTrans
 * @returns 子コンポーネントのclearTrans
 */
const extendClearTransRaw = (nextTrans: Matrix, currentClearTrans: Matrix): Matrix => {
  const trans = transform(inverse(nextTrans), currentClearTrans)
  // clearTrans では平行移動は無視して歪みや反転・拡大縮小のみを打ち消したいため、
  // eとfの値は0とする。
  return { ...trans, e: 0, f: 0 }
}

/**
 * extendClearTransを前回呼び出したときのzoom値をtransNameごとにキャッシュしておく変数
 */
const lastZoomCache: { [transName: string]: number } = {}

/**
 * extendClearTransを前回呼び出したときのclearTransの計算結果をtransNameごとにキャッシュしておく変数
 */
const clearTransCache: { [transName: string]: Matrix } = {}

/**
 * どれくらいzoom値が変化したときにキャッシュを更新するかを示す量
 */
const lastZoomCacheStep = 0.05

/**
 * 親コンポーネントのclearTransから子コンポーネントのclearTransを計算する。
 * @param transName - 変換の名前。アプリケーション内で一意になるようにする
 * @param zoom - MapStateのzoom値
 * @param nextTrans - 親コンポーネントから子コンポーネントへの座標変換行列
 * @param currentClearTrans - 親コンポーネントのclearTrans
 * @returns 子コンポーネントのclearTrans
 */
export const extendClearTrans = (
  transName: string,
  zoom: number,
  nextTrans: Matrix,
  currentClearTrans: Matrix,
): Matrix => {
  const roundedZoom = Math.round(zoom / lastZoomCacheStep) * lastZoomCacheStep
  const canUseCache =
    transName in lastZoomCache &&
    transName in clearTransCache &&
    lastZoomCache[transName] === roundedZoom
  if (!canUseCache) {
    // zoom値に一定以上の変化があった場合はキャッシュされた値を更新する
    lastZoomCache[transName] = roundedZoom
    clearTransCache[transName] = extendClearTransRaw(nextTrans, currentClearTrans)
  }
  return clearTransCache[transName]
}
