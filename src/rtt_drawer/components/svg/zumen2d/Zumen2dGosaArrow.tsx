import React from 'react'
import { rotateDEG, toSVG } from 'transformation-matrix'
import { BasicStage, Stage, KGPointType, TwoHeimensType } from '../../../../common/types'
import { ZUMEN, ZUMEN_TYPE_TO_AS_XYZ } from '../../../constants'
import {
  getGosaVectorDiff,
  displayGosaValue,
  getAngle,
  selectComparedPoint,
  getGosaVectorDiffTwoHeimens,
} from '../../../utils'
import GosaArrow from '../common/GosaArrow'

type Zumen2dGosaArrowProps = Readonly<{
  zumenType: ZUMEN.HEIMEN | ZUMEN.RITSUMEN1 | ZUMEN.RITSUMEN2 | ZUMEN.SETSU_COMPARISON
  point: KGPointType
  gosaStageSrc: Stage
  gosaStageDst: Stage
  isShowGosaValues: boolean
  isShowGosaArrows: boolean
  gosaValueFontSize: number
  gosaArrowSize: number
  decimalDigits: number
  twoHeimens?: TwoHeimensType
}>

const Zumen2dGosaArrow: React.FC<Zumen2dGosaArrowProps> = ({
  zumenType,
  point,
  gosaStageSrc,
  gosaStageDst,
  isShowGosaValues,
  isShowGosaArrows,
  gosaValueFontSize,
  gosaArrowSize,
  decimalDigits,
  twoHeimens,
}) => {
  const gosaValueStyle = {
    fontSize: `${gosaValueFontSize}px`,
  }
  const { asX, asY } = ZUMEN_TYPE_TO_AS_XYZ[zumenType]

  let gv
  if (zumenType === ZUMEN.SETSU_COMPARISON) {
    const pointDst =
      twoHeimens && twoHeimens.heimenDst ? selectComparedPoint(point, twoHeimens) : undefined
    const pointSrc = point
    gv = pointDst
      ? getGosaVectorDiffTwoHeimens(pointSrc, pointDst, gosaStageSrc, gosaStageDst, zumenType)
      : null
  } else {
    gv = getGosaVectorDiff(point, gosaStageSrc, gosaStageDst, zumenType)
  }
  if (!gv) {
    // 該当するステージのデータがない場合
    return null
  }

  const arrows = []
  const nums = []
  const l = gosaArrowSize
  const sx = gv[asX] >= 0 ? 1 : -1 // 矢印の向きを決めるための変数
  const sy = gv[asY] >= 0 ? -1 : 1 // 矢印の向きを決めるための変数
  const deg = getAngle(zumenType, point)
  let isAbs: boolean
  let isParens: boolean

  switch (zumenType) {
    case ZUMEN.HEIMEN:
    case ZUMEN.SETSU_COMPARISON: {
      isAbs = true
      isParens = false
      break
    }
    case ZUMEN.RITSUMEN1:
    case ZUMEN.RITSUMEN2: {
      isAbs = false
      isParens = false
      break
    }
    default:
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`変数が不正です。 zumenType: ${zumenType}`)
  }

  // x方向
  arrows.push(
    <GosaArrow
      key='arrow-x'
      xFrom={-sx * l}
      yFrom={-sy * l}
      xTo={sx * l}
      yTo={-sy * l}
      stage={BasicStage.KIH}
      isMarkerBoth={gv[asX] === 0}
    />,
  )
  nums.push(
    <text
      key='num-x'
      x={sx * l}
      y={-sy * 2 * l}
      dominantBaseline='central'
      textAnchor='middle'
      style={gosaValueStyle}
      transform={toSVG(rotateDEG(-deg, sx * l, -sy * 2 * l))}
    >
      {displayGosaValue(gv[asX], decimalDigits, isAbs, isParens)}
    </text>,
  )

  // y方向
  arrows.push(
    <GosaArrow
      key='arrow-y'
      xFrom={-sx * l}
      yFrom={-sy * l}
      xTo={-sx * l}
      yTo={sy * l}
      stage={BasicStage.KIH}
      isMarkerBoth={gv[asY] === 0}
    />,
  )
  nums.push(
    <text
      key='num-y'
      x={-sx * 2 * l}
      y={sy * l}
      dominantBaseline='central'
      textAnchor='middle'
      style={gosaValueStyle}
      transform={toSVG(rotateDEG(-deg, -sx * 2 * l, sy * l))}
    >
      {displayGosaValue(gv[asY], decimalDigits, isAbs, isParens)}
    </text>,
  )

  // z方向
  if (zumenType === ZUMEN.HEIMEN) {
    isAbs = false
    isParens = true
    nums.push(
      <text
        key='num-z'
        x={-sx * 2 * l}
        y={-sy * 2 * l}
        dominantBaseline='central'
        textAnchor='middle'
        style={gosaValueStyle}
        transform={toSVG(rotateDEG(-deg, -sx * 2 * l, -sy * 2 * l))}
      >
        {displayGosaValue(gv.z, decimalDigits, isAbs, isParens)}
      </text>,
    )
  }

  return (
    <g transform={`rotate(${deg})`}>
      {isShowGosaArrows ? arrows : null}
      {isShowGosaValues ? nums : null}
    </g>
  )
}

export default React.memo(Zumen2dGosaArrow)
