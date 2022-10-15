import React from 'react'
import sortBy from 'lodash/sortBy'
import { Stage, SetsuListType, PointsType } from '../../../../common/types'
import { XOrY } from '../../../constants'
import { getGosaVector, RTTDrawerError } from '../../../utils'
import SingleColumnLink from './SingleColumnLink'

type SingleColumnLinksProps = Readonly<{
  xy: XOrY
  setsuList: SetsuListType
  singleColumnPoints: PointsType
  stage: Stage
  gosaScale: number
  strokeWidth: number
}>

const SingleColumnLinks: React.FC<SingleColumnLinksProps> = ({
  xy,
  setsuList,
  singleColumnPoints,
  stage,
  gosaScale,
  strokeWidth,
}) => {
  const sortedSetsuNames = sortBy(
    Object.keys(setsuList),
    (setsuName) => setsuList[setsuName],
  ).filter((setsuName) => {
    const point = singleColumnPoints[setsuName]
    return point && getGosaVector(point, stage)
  })
  const links = sortedSetsuNames.slice(0, sortedSetsuNames.length - 1).map((setsuNameLower, i) => {
    const setsuNameUpper = sortedSetsuNames[i + 1]
    const pointUpper = singleColumnPoints[setsuNameUpper]
    const pointLower = singleColumnPoints[setsuNameLower]
    const zUpper = setsuList[setsuNameUpper]
    const zLower = setsuList[setsuNameLower]

    if (zUpper === undefined || zLower === undefined) {
      throw new RTTDrawerError('節のデータが存在しません。')
    }

    return (
      <SingleColumnLink
        key={`${zUpper}-${zLower}`}
        xy={xy}
        stage={stage}
        zUpper={zUpper}
        zLower={zLower}
        pointUpper={pointUpper}
        pointLower={pointLower}
        gosaScale={gosaScale}
        strokeWidth={strokeWidth}
      />
    )
  })

  return <g className='svg-single-column-links'>{links}</g>
}

export default React.memo(SingleColumnLinks)
