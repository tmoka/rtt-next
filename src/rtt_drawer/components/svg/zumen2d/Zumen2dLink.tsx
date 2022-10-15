import React from 'react'
import { Stage, PointsType } from '../../../../common/types'
import { ZUMEN, getStageColor, COLOR_SETSU_COMPARISON_SRC } from '../../../constants'
import { getStageXY } from '../../../utils'

type Zumen2dLinkProps = Readonly<{
  stage: Stage
  link: string[]
  points: PointsType
  gosaScale: number
  strokeWidth: number
  zumenType: ZUMEN.HEIMEN | ZUMEN.RITSUMEN1 | ZUMEN.RITSUMEN2 | ZUMEN.SETSU_COMPARISON
  isSetsuComparisonSrc: boolean
}>

const Zumen2dLink: React.FC<Zumen2dLinkProps> = ({
  stage,
  link,
  points,
  gosaScale,
  strokeWidth,
  zumenType,
  isSetsuComparisonSrc,
}) => {
  const ps = [points[link[0]], points[link[1]]]
  if (!ps[0] || !ps[1]) {
    // ポイントが見つからなかった場合
    return null
  }
  const { x: x1, y: y1 } = getStageXY(ps[0], stage, gosaScale, zumenType)
  const { x: x2, y: y2 } = getStageXY(ps[1], stage, gosaScale, zumenType)
  const color = isSetsuComparisonSrc ? COLOR_SETSU_COMPARISON_SRC : getStageColor(stage)

  return (
    <line
      key={`${link[0]}_${link[1]}`}
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={color}
      strokeWidth={strokeWidth}
    />
  )
}

export default React.memo(Zumen2dLink)
