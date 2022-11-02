import React from 'react'
import { Stage, KGPointType } from '../../../../common/types'
import { getStageColor, XOrY } from '../../../constants'
import { getGosaVector, toXYKey } from '../../../utils'

type SingleColumnLinkProps = Readonly<{
  xy: XOrY
  stage: Stage
  zUpper: number
  zLower: number
  pointUpper: KGPointType
  pointLower: KGPointType
  gosaScale: number
  strokeWidth: number
}>

const SingleColumnLink: React.FC<SingleColumnLinkProps> = ({
  xy,
  stage,
  zUpper,
  zLower,
  pointUpper,
  pointLower,
  gosaScale,
  strokeWidth,
}) => {
  const [xUpper, xLower] = [pointUpper, pointLower].map((point) => {
    if (!point) {
      return null
    }
    const gv = getGosaVector(point, stage)
    if (!gv) {
      return null
    }

    const x = point[toXYKey(xy)] + gv[toXYKey(xy)] * gosaScale
    return x
  })
  if (xUpper === null || xLower === null) {
    return null
  }
  const color = getStageColor(stage)

  return (
    <line
      key={`${zUpper}_${zLower}`}
      x1={xUpper}
      y1={zUpper}
      x2={xLower}
      y2={zLower}
      stroke={color}
      strokeWidth={strokeWidth}
    />
  )
}

export default React.memo(SingleColumnLink)
