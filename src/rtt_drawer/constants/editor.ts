import { XYPointObject } from './map'

/** 図形の始点と終点を表す型 */
export interface Corners {
  start: XYPointObject
  end: XYPointObject
}

/** 図形がx方向, y方向にそれぞれ反転しているかどうかを表す型 */
export interface InvertedState {
  x?: boolean
  y?: boolean
}

/** 図形ID */
export type EditorShapeId = string

/** 図形の種類 */
export enum EditorShapeKind {
  RECT = 'EDITOR_SHAPE_RECT',
  LINE = 'EDITOR_SHAPE_LINE',
}

/** 図形データを表す型 */
export interface EditorShape {
  id: EditorShapeId
  kind: EditorShapeKind
  x: number
  y: number
  width: number
  height: number
  inverted?: InvertedState
}

/** react-shape-editor の図形 component の props に追加で渡す props の型 */
export interface ExtraShapeProps {
  inverted?: InvertedState
}

/** 図形の線の色 */
export const SHAPE_STROKE = 'rgba(0,128,0,1)'
/** 編集中の図形の線の色 */
export const SHAPE_STROKE_DISABLED = 'rgba(0,128,0,0.5)'

/** 図形の先の太さの倍率 */
export const SHAPE_STROKE_WIDTH_SCALE = 2

/** 図形編集を水平・垂直方向に固定するためのキー */
export const SHAPE_CONSTRAIN_KEY = 'altKey'
