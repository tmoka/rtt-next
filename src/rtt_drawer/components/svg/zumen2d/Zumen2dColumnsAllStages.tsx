import React from 'react'
import { Matrix } from 'transformation-matrix'
import { TwoHeimensType, Zumen2dType } from '../../../../common/types'
import {
  selectZumen2dStagesToRender,
  selectZumen2dGosaStageSrcDst,
  selectSetsuComparisonDstStagesToRender,
} from '../../../utils'
import { ZUMEN, MenuConfigType } from '../../../constants'
import Zumen2dColumns from './Zumen2dColumns'

type Zumen2dColumnsAllStagesProps = Readonly<{
  menuConfig: MenuConfigType
  zumen2d: Zumen2dType
  clearTrans: Matrix
  zumenType: ZUMEN.HEIMEN | ZUMEN.RITSUMEN1 | ZUMEN.RITSUMEN2 | ZUMEN.SETSU_COMPARISON
  twoHeimens?: TwoHeimensType
  isSetsuComparisonSrc: boolean
}>

const Zumen2dColumnsAllStages: React.FC<Zumen2dColumnsAllStagesProps> = ({
  menuConfig,
  zumen2d,
  clearTrans,
  zumenType,
  twoHeimens,
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

  const { gosaStageSrc, gosaStageDst } = selectZumen2dGosaStageSrcDst(menuConfig)
  const renderColumns = stagesToRender
    .reverse()
    .map((stage) => (
      <Zumen2dColumns
        key={stage}
        zumenType={zumenType}
        points={zumen2d.points}
        stage={stage}
        shouldRenderGosaHeimen={stage === menuConfig.stageSrc}
        gosaStageSrc={gosaStageSrc}
        gosaStageDst={gosaStageDst}
        gosaDisplayType={menuConfig.gosaDisplayType}
        isShowGosaValues={menuConfig.isShowGosaValues}
        isShowGosaArrows={menuConfig.isShowGosaArrows}
        gosaValueFontSize={menuConfig.gosaValueFontSize}
        gosaArrowSize={menuConfig.gosaArrowSize}
        gosaScale={menuConfig.gosaScale}
        columnSize={menuConfig.columnSize}
        decimalDigits={menuConfig.decimalDigits}
        clearTrans={clearTrans}
        twoHeimens={twoHeimens}
        isSetsuComparisonSrc={isSetsuComparisonSrc}
      />
    ))
  return <g>{renderColumns}</g>
}

export default React.memo(Zumen2dColumnsAllStages)
