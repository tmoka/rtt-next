import React from 'react'
import { Stage, KGPointType, TwoHeimensType } from '../../../../common/types'
import { ZUMEN, ZUMEN_TYPE_TO_AS_XYZ, DEFAULT_STROKE_WIDTH } from '../../../constants'
import {
  getGosaVectorDiff,
  displayGosaValue,
  selectComparedPoint,
  getGosaVectorDiffTwoHeimens,
} from '../../../utils'

type Zumen2dGosaTableProps = Readonly<{
  zumenType: ZUMEN.HEIMEN | ZUMEN.RITSUMEN1 | ZUMEN.RITSUMEN2 | ZUMEN.SETSU_COMPARISON
  point: KGPointType
  gosaStageSrc: Stage
  gosaStageDst: Stage
  gosaValueFontSize: number
  decimalDigits: number
  twoHeimens?: TwoHeimensType
}>

const Zumen2dGosaTable: React.FC<Zumen2dGosaTableProps> = ({
  zumenType,
  point,
  gosaStageSrc,
  gosaStageDst,
  gosaValueFontSize,
  decimalDigits,
  twoHeimens,
}) => {
  const gosaValueStyle = {
    fontSize: `${gosaValueFontSize}px`,
  }
  if (zumenType !== ZUMEN.HEIMEN && zumenType !== ZUMEN.SETSU_COMPARISON) {
    return null
  }
  const { asX, asY, asZ } = ZUMEN_TYPE_TO_AS_XYZ[zumenType]

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

  const isAbs = false
  const isParens = false
  const width = `${(decimalDigits + 6) / 2}em`
  const textX = displayGosaValue(gv[asX], decimalDigits, isAbs, isParens)
  const textY = displayGosaValue(gv[asY], decimalDigits, isAbs, isParens)
  const textZ = displayGosaValue(gv[asZ], decimalDigits, isAbs, isParens)

  return (
    <g>
      <rect
        x='0'
        y='0'
        width={width}
        height='1.2em'
        fill='white'
        stroke='black'
        strokeWidth={DEFAULT_STROKE_WIDTH}
        style={gosaValueStyle}
      />
      <rect
        x='0'
        y='1.2em'
        width={width}
        height='1.2em'
        fill='white'
        stroke='black'
        strokeWidth={DEFAULT_STROKE_WIDTH}
        style={gosaValueStyle}
      />
      <rect
        x='0'
        y='2.4em'
        width={width}
        height='1.2em'
        fill='white'
        stroke='black'
        strokeWidth={DEFAULT_STROKE_WIDTH}
        style={gosaValueStyle}
      />
      <line
        x1='0.7em'
        y1={0}
        x2='0.7em'
        y2='3.6em'
        stroke='black'
        strokeWidth={DEFAULT_STROKE_WIDTH}
        style={gosaValueStyle}
      />
      <text x={0} y='0.5em' dominantBaseline='central' textAnchor='start' style={gosaValueStyle}>
        x
      </text>
      <text x='1em' y='0.5em' dominantBaseline='central' textAnchor='start' style={gosaValueStyle}>
        {textX}
      </text>
      <text x={0} y='1.7em' dominantBaseline='central' textAnchor='start' style={gosaValueStyle}>
        y
      </text>
      <text x='1em' y='1.7em' dominantBaseline='central' textAnchor='start' style={gosaValueStyle}>
        {textY}
      </text>
      <text x={0} y='2.9em' dominantBaseline='central' textAnchor='start' style={gosaValueStyle}>
        z
      </text>
      <text x='1em' y='2.9em' dominantBaseline='central' textAnchor='start' style={gosaValueStyle}>
        {textZ}
      </text>
    </g>
  )
}

export default React.memo(Zumen2dGosaTable)
