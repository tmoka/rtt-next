import React from 'react'
import { applyToPoint, inverse, Matrix } from 'transformation-matrix'
import { AXIS, TorishinListType, SetsuListType } from '../../../../common/types'
import { ZUMEN, XOrY } from '../../../constants'
import {
  calcIntersection,
  getTorishinEndPoints,
  IntersectType,
  RTTDrawerError,
} from '../../../utils'
import SetsuLabels from './SetsuLabels'
import ToriLabel from './ToriLabel'

type ToriLabelsProps = Readonly<{
  zumenType:
    | ZUMEN.HEIMEN
    | ZUMEN.RITSUMEN1
    | ZUMEN.RITSUMEN2
    | ZUMEN.GAIHEKI1
    | ZUMEN.GAIHEKI2
    | ZUMEN.SETSU_COMPARISON
  xy: XOrY
  torishinList: TorishinListType
  torishinSize: number
  // メインの描画領域の座標変換行列
  bodyTrans: Matrix
  clearTrans: Matrix
}>

/**
 * 通り芯ラベル（ = 通り芯名を○で囲んだもの）を描画するコンポーネント
 */
const ToriLabels: React.FC<ToriLabelsProps> = ({
  zumenType,
  xy,
  torishinList,
  torishinSize,
  bodyTrans,
  clearTrans,
}) => {
  // 斜め通り芯名の描画に必要。
  // originPoint を通るx方向、もしくはy方向の直線と斜め通り芯が交わる場所に通り芯名を描画する。
  const originPoint = applyToPoint(inverse(bodyTrans), { x: 0, y: 0 })

  const toriLabels = Object.keys(torishinList).map((toriName) => {
    const torishin = torishinList[toriName]
    if (!torishin) {
      throw new RTTDrawerError(`通り芯が存在しません。 torishin_name: ${toriName}`)
    }

    const torishinEndPoints = getTorishinEndPoints(torishin, zumenType)
    if (!torishinEndPoints) {
      // 平面以外では斜め通り芯を描画しない
      return null
    }
    const { x1, y1, x2, y2 } = torishinEndPoints

    const intersectResult = calcIntersection(
      x1,
      y1,
      x2,
      y2,
      originPoint.x,
      originPoint.y,
      originPoint.x + (xy === XOrY.X ? 1 : 0),
      originPoint.y + (xy === XOrY.Y ? 1 : 0),
    )

    if (
      intersectResult.type === IntersectType.COLINEAR ||
      intersectResult.type === IntersectType.PARALLEL
    ) {
      // 交点がない場合
      return null
    }
    const intersection = intersectResult.point

    return (
      <ToriLabel
        key={toriName}
        x={xy === XOrY.X ? intersection.x : torishinSize + 1}
        y={xy === XOrY.Y ? intersection.y : torishinSize + 1}
        torishinSize={torishinSize}
        toriName={toriName}
        clearTrans={clearTrans}
      />
    )
  })
  return <g className='svg-zumen2d-tori-labels'>{toriLabels}</g>
}

type SetsuOrToriLabelsProps = Readonly<{
  zumenType:
    | ZUMEN.HEIMEN
    | ZUMEN.RITSUMEN1
    | ZUMEN.RITSUMEN2
    | ZUMEN.GAIHEKI1
    | ZUMEN.GAIHEKI2
    | ZUMEN.SETSU_COMPARISON
  // SVGのどの方向向けにラヘルを描画するか
  xy: XOrY
  // KGPoint のどの軸のデータを描画する
  asXY: AXIS
  torishinList: TorishinListType
  torishinSize: number
  // メインの描画領域の座標変換行列
  bodyTrans: Matrix
  setsuList: SetsuListType
  zAxisWidth: number
  isShowSetsuZValues: boolean
  clearTrans: Matrix
}>

/**
 * SVGのどの方向向けに描画するかによって、節ラベルもしくは通り芯ラベルを描画する
 */
const SetsuOrToriLabels: React.FC<SetsuOrToriLabelsProps> = ({
  zumenType,
  xy,
  asXY,
  torishinList,
  torishinSize,
  bodyTrans,
  setsuList,
  zAxisWidth,
  isShowSetsuZValues,
  clearTrans,
}) => {
  switch (asXY) {
    case 'x':
    case 'y':
      return (
        <ToriLabels
          zumenType={zumenType}
          xy={xy}
          torishinList={torishinList}
          torishinSize={torishinSize}
          bodyTrans={bodyTrans}
          clearTrans={clearTrans}
        />
      )
    case 'z':
      return (
        <SetsuLabels
          setsuList={setsuList}
          zAxisWidth={zAxisWidth}
          isShowSetsuZValues={isShowSetsuZValues}
          clearTrans={clearTrans}
        />
      )
    default:
      throw new Error(`変数が不正です。 asXY: ${asXY}`)
  }
}

export default SetsuOrToriLabels
