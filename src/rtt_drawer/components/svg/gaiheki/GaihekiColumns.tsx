import React from 'react'
import { toSVG, Matrix } from 'transformation-matrix'
import { BasicStage, ColForm, KGPointType, PointsType, Stage } from '../../../../common/types'
import { getStageColor, ZUMEN, ZUMEN_TYPE_TO_AS_XYZ } from '../../../constants'
import SVGLayer from '../common/SVGLayer'
import PointMark from '../common/PointMark'
import { getStageXY, getGosaVector } from '../../../utils'

type GaihekiColumnProps = Readonly<{
  point: KGPointType
  stage: Stage
  gosaScale: number
  zumenType: ZUMEN.GAIHEKI1 | ZUMEN.GAIHEKI2
  columnSize: number
  fontSize: number
  strokeWidth: number
  gaihekiTrans: Matrix
  gaihekiClearTrans: Matrix
  clearTrans: Matrix
  decimalDigits: number
  isPlus: boolean
  gosaStageDst: Stage
  isShowGosaValues: boolean
}>

const GaihekiColumn: React.FC<GaihekiColumnProps> = ({
  point,
  stage,
  gosaScale,
  zumenType,
  columnSize,
  fontSize,
  strokeWidth,
  gaihekiTrans,
  gaihekiClearTrans,
  clearTrans,
  decimalDigits,
  isPlus,
  gosaStageDst,
  isShowGosaValues,
}) => {
  const { asZ } = ZUMEN_TYPE_TO_AS_XYZ[zumenType]
  const k1 = isPlus ? -1 : 1
  const k2 = zumenType === ZUMEN.GAIHEKI1 ? 1 : -1

  const { x, y } = getStageXY(point, BasicStage.KIH, gosaScale, zumenType)

  const gv = getGosaVector(point, stage)
  if (!gv) {
    return null
  }

  const gosa = gv[asZ]
  const gosaStageX = k1 * gosa * gosaScale
  const gosaStr = gosa.toFixed(decimalDigits)

  let leftStr
  let rightStr
  const shouldRenderGosaValue = isShowGosaValues && stage === gosaStageDst
  if (shouldRenderGosaValue) {
    if (k2 * gosaStageX > 0) {
      leftStr = k1 * k2 > 0 ? `+${gosaStr}` : gosaStr
    } else {
      rightStr = k1 * k2 > 0 ? gosaStr : `+${gosaStr}`
    }
  }

  return (
    <SVGLayer key={point.name} x={x} y={y} transformMat={clearTrans} clip={false}>
      <g transform={toSVG(gaihekiTrans)}>
        <line
          x1={0}
          y1={0}
          x2={gosaStageX}
          y2={0}
          stroke={getStageColor(BasicStage.KIH)}
          strokeWidth={strokeWidth}
        />
        <SVGLayer x={gosaStageX} y={0} transformMat={gaihekiClearTrans} clip={false}>
          <PointMark
            id={point.name}
            colForm={ColForm.C}
            stage={stage}
            markSize={columnSize}
            fontSize={fontSize}
            leftStr={leftStr}
            rightStr={rightStr}
            point={point}
            zumenType={zumenType}
            isSetsuComparisonSrc={false}
          />
        </SVGLayer>
      </g>
    </SVGLayer>
  )
}

type GaihekiColumnsProps = Readonly<{
  points: PointsType
  stage: Stage
  gosaScale: number
  zumenType: ZUMEN.GAIHEKI1 | ZUMEN.GAIHEKI2
  columnSize: number
  fontSize: number
  strokeWidth: number
  gaihekiTrans: Matrix
  gaihekiClearTrans: Matrix
  clearTrans: Matrix
  decimalDigits: number
  isPlus: boolean
  gosaStageDst: Stage
  isShowGosaValues: boolean
}>

const GaihekiColumns: React.FC<GaihekiColumnsProps> = ({
  points,
  stage,
  gosaScale,
  zumenType,
  columnSize,
  fontSize,
  strokeWidth,
  gaihekiTrans,
  gaihekiClearTrans,
  clearTrans,
  decimalDigits,
  isPlus,
  gosaStageDst,
  isShowGosaValues,
}) => {
  const columnElems = Object.keys(points).map((pointKey) => (
    <GaihekiColumn
      key={pointKey}
      point={points[pointKey]}
      stage={stage}
      gosaScale={gosaScale}
      zumenType={zumenType}
      columnSize={columnSize}
      fontSize={fontSize}
      strokeWidth={strokeWidth}
      gaihekiTrans={gaihekiTrans}
      gaihekiClearTrans={gaihekiClearTrans}
      clearTrans={clearTrans}
      decimalDigits={decimalDigits}
      isPlus={isPlus}
      gosaStageDst={gosaStageDst}
      isShowGosaValues={isShowGosaValues}
    />
  ))

  return <g>{columnElems}</g>
}

export default React.memo(GaihekiColumns)
