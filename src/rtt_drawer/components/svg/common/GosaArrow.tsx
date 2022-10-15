import React from 'react'
import { BasicStage, Stage } from '../../../../common/types'
import { getStageColor } from '../../../constants'

type GosaArrowProps = Readonly<{
  // 誤差矢印の始点のx, y座標
  xFrom: number
  yFrom: number
  // 誤差矢印の終点のx, y座標
  xTo: number
  yTo: number
  // どのステージの色で描画するか
  stage?: Stage
  // 終点に加えて始点にも矢印を描画するかどうか
  isMarkerBoth?: boolean
}>

/**
 * 誤差矢印を描画するコンポーネント
 */
const GosaArrow: React.FC<GosaArrowProps> = ({
  xFrom,
  yFrom,
  xTo,
  yTo,
  stage = BasicStage.KIH,
  isMarkerBoth = false,
}) => {
  const color = getStageColor(stage)
  const style = {
    markerStart: isMarkerBoth ? `url(#svg-marker-gosa-arrow-start-${stage})` : '',
    markerEnd: `url(#svg-marker-gosa-arrow-end-${stage})`,
  }

  return <path d={`M${xFrom},${yFrom} ${xTo},${yTo}`} stroke={color} style={style} />
}

export default React.memo(GosaArrow)
