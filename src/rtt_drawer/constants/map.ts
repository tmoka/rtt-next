/**
 * 描画範囲の root 座標系での幅
 */
export const ROOT_WIDTH = 1200

/**
 * 描画範囲の root 座標系での高さ
 */
export const ROOT_HEIGHT = 900

/**
 * ヘッダの高さ
 */
export const HEADER_HEIGHT = 64

/**
 * 図面本体の root 座標系での幅
 */
export const ZUMEN_WIDTH = ROOT_WIDTH

/**
 * 図面本体の root 座標系での高さ
 */
export const ZUMEN_HEIGHT = ROOT_HEIGHT - HEADER_HEIGHT

/**
 * 線の太さのデフォルト値
 */
export const DEFAULT_STROKE_WIDTH = 1.5

/* eslint-disable no-nested-ternary */
const mouseWheelEventTemp =
  process.env.TARGET === 'node'
    ? ''
    : 'onwheel' in document
    ? 'wheel'
    : 'onmousewheel' in document
    ? 'mousewheel'
    : 'DOMMouseScroll'
/* eslint-enable no-nested-ternary */

/**
 * マウスホイールの回転を表すイベント名。
 * ブラウザによってイベント名が統一されていないので、実行時に判定する。
 */
export const MOUSE_WHEEL_EVENT = mouseWheelEventTemp as 'wheel'

/**
 * MapStateType.zoom の最小値
 */
export const MIN_ZOOM = -10

/**
 * MapStateType.zoom の最大値
 */
export const MAX_ZOOM = 10

/**
 * SVG描画領域の移動と拡大縮小の状態を表すデータの型
 */
export interface MapState {
  readonly rootOffset: XYPointObject
  readonly zoom: number
}

/**
 * XY座標を表すデータの型（タプル）
 */
export type XYPointTuple = [number, number]

/**
 * XY座標を表すデータの型（オブジェクト）
 */
export interface XYPointObject {
  readonly x: number
  readonly y: number
}

/**
 * x か y かを表す型
 */
export enum XOrY {
  X = 'X',
  Y = 'Y',
}

/**
 * MapStateTypeの初期値
 */
export const initialMapState: MapState = {
  rootOffset: { x: 0, y: 0 },
  zoom: 0,
}

/**
 * SVGに描画するXY座標の範囲
 */
export interface ZumenRangeType {
  minX: number
  maxX: number
  minY: number
  maxY: number
}
