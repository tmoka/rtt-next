import React from 'react'
import { Zumen2dType } from '../../../../common/types'
import { selectSetsuComparisonDstStagesToRender, selectZumen2dStagesToRender } from '../../../utils'
import { ZUMEN, MenuConfigType } from '../../../constants'
import Zumen2dLinks from './Zumen2dLinks'

type Zumen2dLinksAllStagesProps = Readonly<{
  menuConfig: MenuConfigType
  zumen2d: Zumen2dType
  strokeWidth: number
  zumenType: ZUMEN.HEIMEN | ZUMEN.RITSUMEN1 | ZUMEN.RITSUMEN2 | ZUMEN.SETSU_COMPARISON
  isSetsuComparisonSrc: boolean
}>

const Zumen2dLinksAllStages: React.FC<Zumen2dLinksAllStagesProps> = ({
  menuConfig,
  zumen2d,
  strokeWidth,
  zumenType,
  isSetsuComparisonSrc,
}) => {
  let stagesToRender
  if (zumenType === ZUMEN.SETSU_COMPARISON) {
    if (isSetsuComparisonSrc) {
      stagesToRender = menuConfig.isShowColumnStageSrc ? [menuConfig.stageSrc] : []
    } else {
      stagesToRender = selectSetsuComparisonDstStagesToRender(menuConfig)
    }
  } else {
    stagesToRender = selectZumen2dStagesToRender(menuConfig)
  }

  const renderLinks = menuConfig.isShowLinks
    ? stagesToRender.map((stage) => (
        <Zumen2dLinks
          key={stage}
          zumenType={zumenType}
          stage={stage}
          links={zumen2d.links}
          points={zumen2d.points}
          gosaScale={menuConfig.gosaScale}
          strokeWidth={strokeWidth}
          isSetsuComparisonSrc={isSetsuComparisonSrc}
        />
      ))
    : null
  return <g>{renderLinks}</g>
}

export default React.memo(Zumen2dLinksAllStages)
