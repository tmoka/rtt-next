import React from 'react'
import { Stage, LinkType, PointsType } from '../../../../common/types'
import { ZUMEN } from '../../../constants'
import Zumen2dLink from './Zumen2dLink'

type Zumen2dLinksProps = Readonly<{
  zumenType: ZUMEN.HEIMEN | ZUMEN.RITSUMEN1 | ZUMEN.RITSUMEN2 | ZUMEN.SETSU_COMPARISON
  stage: Stage
  links: LinkType[]
  points: PointsType
  gosaScale: number
  strokeWidth: number
  isSetsuComparisonSrc: boolean
}>

const Zumen2dLinks: React.FC<Zumen2dLinksProps> = ({
  zumenType,
  stage,
  links,
  points,
  gosaScale,
  strokeWidth,
  isSetsuComparisonSrc,
}) => {
  const linkElems = links.map((link) => (
    <Zumen2dLink
      key={`${link[0]}_${link[1]}`}
      stage={stage}
      link={link}
      points={points}
      gosaScale={gosaScale}
      strokeWidth={strokeWidth}
      zumenType={zumenType}
      isSetsuComparisonSrc={isSetsuComparisonSrc}
    />
  ))

  return <g>{linkElems}</g>
}

export default React.memo(Zumen2dLinks)
