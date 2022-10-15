import React from 'react'
import { identity, Matrix } from 'transformation-matrix'
import { Stage, PointsType, TwoHeimensType } from '../../../../common/types'
import { ZUMEN, GosaDisplayType } from '../../../constants'
import Zumen2dColumnCoordSystem from './Zumen2dColumnCoordSystem'

type Zumen2dColumnsProps = Readonly<{
  zumenType: ZUMEN.HEIMEN | ZUMEN.RITSUMEN1 | ZUMEN.RITSUMEN2 | ZUMEN.SETSU_COMPARISON
  points: PointsType
  stage: Stage
  shouldRenderGosaHeimen: boolean
  gosaStageSrc: Stage
  gosaStageDst: Stage
  gosaDisplayType: GosaDisplayType
  isShowGosaValues: boolean
  isShowGosaArrows: boolean
  gosaValueFontSize: number
  gosaArrowSize: number
  gosaScale: number
  columnSize: number
  decimalDigits: number
  clearTrans?: Matrix
  twoHeimens?: TwoHeimensType
  isSetsuComparisonSrc: boolean
}>

const Zumen2dColumns: React.FC<Zumen2dColumnsProps> = ({
  zumenType,
  points,
  stage,
  shouldRenderGosaHeimen,
  gosaStageSrc,
  gosaStageDst,
  gosaDisplayType,
  isShowGosaValues,
  isShowGosaArrows,
  gosaValueFontSize,
  gosaArrowSize,
  gosaScale,
  decimalDigits,
  columnSize,
  clearTrans = identity(),
  twoHeimens,
  isSetsuComparisonSrc,
}) => {
  if (gosaStageDst && gosaStageSrc) {
    const columnElems = Object.keys(points).map((pointKey) => (
      <Zumen2dColumnCoordSystem
        key={pointKey}
        zumenType={zumenType}
        point={points[pointKey]}
        stage={stage}
        shouldRenderGosaHeimen={shouldRenderGosaHeimen}
        gosaStageSrc={gosaStageSrc}
        gosaStageDst={gosaStageDst}
        gosaDisplayType={gosaDisplayType}
        isShowGosaValues={isShowGosaValues}
        isShowGosaArrows={isShowGosaArrows}
        gosaValueFontSize={gosaValueFontSize}
        gosaArrowSize={gosaArrowSize}
        gosaScale={gosaScale}
        columnSize={columnSize}
        decimalDigits={decimalDigits}
        clearTrans={clearTrans}
        twoHeimens={twoHeimens}
        isSetsuComparisonSrc={isSetsuComparisonSrc}
      />
    ))
    return <g>{columnElems}</g>
  }
  return null
}

export default React.memo(Zumen2dColumns)
