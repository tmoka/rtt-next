import { XYPointObject } from '../constants'

/**
 * 2直線の交わり方
 */
export enum IntersectType {
  COLINEAR = 'COLINEAR', // 2つの線分が同一直線上にある場合
  PARALLEL = 'PARALLEL', // 2つの線分が平行の場合
  OUTER = 'OUTER', // 2つの線分が線分上では交わらないが、線分の延長線上で交わる場合
  INTERSECTING = 'INTERSECTING', // 2つの線分が交わる場合
}

/**
 * 2直線の交点の計算結果
 */
export type IntersectResultType =
  | { type: IntersectType.COLINEAR }
  | { type: IntersectType.PARALLEL }
  | { type: IntersectType.OUTER; point: XYPointObject }
  | { type: IntersectType.INTERSECTING; point: XYPointObject }

/**
 * 線分(l1x1, l1y1)--(l1x2, l1y2) と 線分(l2x1, l2y1)--(l2x2, l2y2) の交点を計算する
 * @returns 計算結果
 * @remarks 参考: https://github.com/psalaets/line-intersect
 */
export const calcIntersection = (
  l1x1: number,
  l1y1: number,
  l1x2: number,
  l1y2: number,
  l2x1: number,
  l2y1: number,
  l2x2: number,
  l2y2: number,
): IntersectResultType => {
  const denom = (l2y2 - l2y1) * (l1x2 - l1x1) - (l2x2 - l2x1) * (l1y2 - l1y1)
  const numeA = (l2x2 - l2x1) * (l1y1 - l2y1) - (l2y2 - l2y1) * (l1x1 - l2x1)
  const numeB = (l1x2 - l1x1) * (l1y1 - l2y1) - (l1y2 - l1y1) * (l1x1 - l2x1)

  if (denom === 0) {
    if (numeA === 0 && numeB === 0) {
      return { type: IntersectType.COLINEAR }
    }
    return { type: IntersectType.PARALLEL }
  }

  const uA = numeA / denom
  const uB = numeB / denom
  const isIntersecting = uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1
  const point = {
    x: l1x1 + uA * (l1x2 - l1x1),
    y: l1y1 + uA * (l1y2 - l1y1),
  }
  return isIntersecting
    ? { type: IntersectType.INTERSECTING, point }
    : { type: IntersectType.OUTER, point }
}
