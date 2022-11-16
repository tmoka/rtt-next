import React from 'react'
import { Matrix } from 'transformation-matrix'
import { Stage, ColForm, KGPointType, TwoHeimensType } from '../../../../common/types'
import { GosaDisplayType, ZUMEN } from '../../../constants'
import { getStageXY } from '../../../utils'
import SVGLayer from '../common/SVGLayer'
import PointMark from '../common/PointMark'
import Zumen2dGosaArrow from './Zumen2dGosaArrow'
import Zumen2dGosaTable from './Zumen2dGosaTable'

type Zumen2dColumnCoordSystemProps = Readonly<{
  zumenType: ZUMEN.HEIMEN | ZUMEN.RITSUMEN1 | ZUMEN.RITSUMEN2 | ZUMEN.SETSU_COMPARISON
  point: KGPointType
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
  clearTrans: Matrix
  twoHeimens?: TwoHeimensType
  isSetsuComparisonSrc: boolean
}>

const Zumen2dColumnCoordSystem: React.FC<Zumen2dColumnCoordSystemProps> = ({
  zumenType,
  point,
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
  clearTrans,
  twoHeimens,
  isSetsuComparisonSrc,
}) => {
  const { x, y } = getStageXY(point, stage, gosaScale, zumenType)
  const colForm =
    zumenType === ZUMEN.HEIMEN || zumenType === ZUMEN.SETSU_COMPARISON ? point.colForm : ColForm.C

  const tableX = columnSize / 2 + 5
  const tableY = -(gosaValueFontSize * 3.6 + columnSize / 2 + 5)

  let shouldRenderGosa = false
  switch (zumenType) {
    case ZUMEN.HEIMEN:
    case ZUMEN.RITSUMEN1:
    case ZUMEN.RITSUMEN2:
      shouldRenderGosa = shouldRenderGosaHeimen
      break
    case ZUMEN.SETSU_COMPARISON:
      shouldRenderGosa = isSetsuComparisonSrc
      break
    default:
      break
  }

  const renderGosa =
    gosaDisplayType === GosaDisplayType.VECTOR ? (
      <Zumen2dGosaArrow
        zumenType={zumenType}
        point={point}
        gosaStageSrc={gosaStageSrc}
        gosaStageDst={gosaStageDst}
        isShowGosaValues={isShowGosaValues}
        isShowGosaArrows={isShowGosaArrows}
        gosaValueFontSize={gosaValueFontSize}
        gosaArrowSize={gosaArrowSize}
        decimalDigits={decimalDigits}
        twoHeimens={twoHeimens}
      />
    ) : (
      <SVGLayer x={tableX} y={tableY} clip={false}>
        <Zumen2dGosaTable
          zumenType={zumenType}
          point={point}
          gosaStageSrc={gosaStageSrc}
          gosaStageDst={gosaStageDst}
          gosaValueFontSize={gosaValueFontSize}
          decimalDigits={decimalDigits}
          twoHeimens={twoHeimens}
        />
      </SVGLayer>
    )

  return (
    <SVGLayer key={point.name} x={x} y={y} transformMat={clearTrans} clip={false}>
      <PointMark
        id={point.name}
        colForm={colForm}
        stage={stage}
        markSize={columnSize}
        point={point}
        zumenType={zumenType}
        isSetsuComparisonSrc={isSetsuComparisonSrc}
      />
      {
        /* stageが比較元と同じときは誤差矢印も一緒に描画する */
        shouldRenderGosa ? renderGosa : null
      }
    </SVGLayer>
  )
}

export default React.memo(Zumen2dColumnCoordSystem)
