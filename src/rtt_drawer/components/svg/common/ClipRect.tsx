import React from 'react'
import { DEFAULT_STROKE_WIDTH } from '../../../constants'

type ClipRectProps = Readonly<{
  // SVG内で一意となるid
  id: string
  // 切り取る長方形の始点のx, y座標
  x?: number
  y?: number
  // 切り取る長方形の幅, 高さ
  width: number
  height: number
  // 枠線を表示するかどうか
  withBorder?: boolean
  // 子要素
  children?: React.ReactNode
}>

/**
 * 子要素の描画領域を長方形に切り取って表示するコンポーネント
 */
const ClipRect: React.FC<ClipRectProps> = ({
  id,
  x = 0,
  y = 0,
  width,
  height,
  withBorder = false,
  children = null,
}) => {
  return (
    <g className='clip-rect'>
      <clipPath id={id}>
        <rect x={x} y={y} width={width} height={height} />
      </clipPath>
      <g style={{ clipPath: `url(#${id})` }}>{children}</g>
      {withBorder ? (
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          stroke='black'
          strokeWidth={DEFAULT_STROKE_WIDTH}
          fill='none'
        />
      ) : null}
    </g>
  )
}

export default ClipRect
