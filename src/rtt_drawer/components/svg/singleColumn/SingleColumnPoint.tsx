import React from 'react'
import { applyToPoint, inverse, Matrix } from 'transformation-matrix'
import { BasicStage, ColForm, KGPointType, Stage } from '../../../../common/types'
import { XOrY, ZUMEN } from '../../../constants'
import { getGosaVector, toXYKey } from '../../../utils'
import SVGLayer from '../common/SVGLayer'
import PointMark from '../common/PointMark'
import GosaArrow from '../common/GosaArrow'

type SingleColumnGosaArrowProps = Readonly<{
  xy: XOrY
  point: KGPointType
  gosaScale: number
  gosaStageDst: Stage
  inversedClearTrans: Matrix // TODO
}>

// clearTrans を使って root 座標系に戻したあとで使う
let SingleColumnGosaArrow: React.FC<SingleColumnGosaArrowProps> = ({
  xy,
  point,
  gosaScale,
  gosaStageDst,
  inversedClearTrans,
}) => {
  const gv = getGosaVector(point, gosaStageDst)
  if (!gv) {
    return null
  }
  const length = gv[toXYKey(xy)] * gosaScale
  if (length === 0) {
    return null
  }
  const { x: rootLength /* , y */ } = applyToPoint(inversedClearTrans, {
    x: length,
    y: 0,
  })
  return <GosaArrow xFrom={0} yFrom={0} xTo={rootLength} yTo={0} />
}

type SingleColumnPointProps = Readonly<{
  xy: XOrY
  point: KGPointType
  stage: Stage
  z: number
  dz: number
  isShowGosaValues: boolean
  isShowGosaArrows: boolean
  isShowGosaKanriAndGosaGenkai: boolean
  gosaValueFontSize: number
  columnSize: number
  gosaScale: number
  gosaStageDst: Stage
  decimalDigits: number
  clearTrans: Matrix
}>

SingleColumnGosaArrow = React.memo(SingleColumnGosaArrow)

const SingleColumnPoint: React.FC<SingleColumnPointProps> = ({
  xy,
  point,
  stage,
  z,
  dz,
  isShowGosaValues,
  isShowGosaArrows,
  isShowGosaKanriAndGosaGenkai,
  gosaValueFontSize,
  columnSize,
  gosaScale,
  gosaStageDst,
  decimalDigits,
  clearTrans,
}) => {
  if (!point) {
    return null
  }
  const gv = getGosaVector(point, stage)
  if (!gv) {
    return null
  }
  const gosa = gv[toXYKey(xy)]
  const x = point[toXYKey(xy)] + gosa * gosaScale

  const shouldRenderGosaArrow = isShowGosaArrows && stage === BasicStage.KIH
  const shouldRenderGosaValue = isShowGosaValues && stage === gosaStageDst

  let leftStr
  let rightStr
  if (shouldRenderGosaValue) {
    const gosaStr = gosa.toFixed(decimalDigits)
    const gosaKanriStr = Math.min(dz / 1000, 10).toFixed(decimalDigits)
    const gosaGenkaiStr = Math.min(dz / 700, 15).toFixed(decimalDigits)
    const shouldShowGosaKanriAndGosaGenkai = isShowGosaKanriAndGosaGenkai && dz !== 0
    if (gosa >= 0) {
      rightStr = shouldShowGosaKanriAndGosaGenkai
        ? `+${gosaStr} (${gosaKanriStr}) [${gosaGenkaiStr}]`
        : `+${gosaStr}`
    } else {
      leftStr = shouldShowGosaKanriAndGosaGenkai
        ? `[${gosaGenkaiStr}] (${gosaKanriStr}) ${gosaStr}`
        : gosaStr
    }
  }

  return (
    <SVGLayer key={z} x={x} y={z} transformMat={clearTrans} clip={false}>
      <PointMark
        id={point.name}
        colForm={ColForm.C}
        stage={stage}
        markSize={columnSize}
        fontSize={gosaValueFontSize}
        leftStr={leftStr}
        rightStr={rightStr}
        point={point}
        zumenType={ZUMEN.SINGLE_COLUMN}
        isSetsuComparisonSrc={false}
      />
      {shouldRenderGosaArrow ? (
        <SingleColumnGosaArrow
          xy={xy}
          point={point}
          gosaScale={gosaScale}
          gosaStageDst={gosaStageDst}
          inversedClearTrans={inverse(clearTrans)}
        />
      ) : null}
    </SVGLayer>
  )
}

export default React.memo(SingleColumnPoint)
