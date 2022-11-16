import React from 'react'
import { STAGE_ORDER } from '../../../common/types'
import { getStageColor, MenuConfigType } from '../../constants'

type DefsProps = Readonly<{
  menuConfig: MenuConfigType
}>

/**
 * svgのdefs要素をrenderするコンポーネント
 */
const Defs: React.FC<DefsProps> = ({ menuConfig }) => {
  const { gosaArrowSize } = menuConfig
  const arrowHeads = STAGE_ORDER.map((stage) => {
    const l = gosaArrowSize * 0.8
    const color = getStageColor(stage)
    const startKey = `svg-marker-gosa-arrow-start-${stage}`
    const endKey = `svg-marker-gosa-arrow-end-${stage}`
    return [
      <marker
        key={startKey}
        id={startKey}
        markerWidth={l}
        markerHeight={l}
        refX={0}
        refY={l / 2}
        orient='auto'
      >
        {/* 誤差矢印の始点部分のマーカー */}
        <path d={`M${l},0 L0,${l / 2} L${l},${l}`} stroke={color} fill='none' />
      </marker>,
      <marker
        key={endKey}
        id={endKey}
        markerWidth={l}
        markerHeight={l}
        refX={l}
        refY={l / 2}
        orient='auto'
      >
        {/* 誤差矢印の終点部分のマーカー */}
        <path d={`M0,0 L${l},${l / 2} L0,${l}`} stroke={color} fill='none' />
      </marker>,
    ]
  })
  return <defs>{arrowHeads}</defs>
}

export default React.memo(Defs)
