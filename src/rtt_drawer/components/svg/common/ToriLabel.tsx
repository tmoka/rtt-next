import React from 'react'
import { Matrix } from 'transformation-matrix'
import { BasicStage, TorishinNameType } from '../../../../common/types'
import { getStageColor } from '../../../constants'
import SVGLayer from './SVGLayer'

type ToriLabelProps = Readonly<{
  x?: number
  y?: number
  // 通り芯名を囲む○のサイズ
  torishinSize: number
  // 通り芯名
  toriName: TorishinNameType
  clearTrans: Matrix
}>

/**
 * 通り芯ラベル（ = 通り芯名を○で囲んだもの）を描画するコンポーネント
 */
const ToriLabel: React.FC<ToriLabelProps> = ({
  x = undefined,
  y = undefined,
  toriName,
  torishinSize,
  clearTrans,
}) => {
  const toriNameStyle = {
    fontSize: `${torishinSize * 0.8}px`,
  }

  return (
    <SVGLayer id={`svg-tori-label-${toriName}`} x={x} y={y} transformMat={clearTrans} clip={false}>
      <circle r={torishinSize} fill='none' stroke={getStageColor(BasicStage.KIH)} />
      <text dominantBaseline='central' textAnchor='middle' style={toriNameStyle}>
        {toriName}
      </text>
    </SVGLayer>
  )
}

export default React.memo(ToriLabel)
