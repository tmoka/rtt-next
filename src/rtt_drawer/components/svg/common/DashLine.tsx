import React from 'react'
import { INFINITY, colorMuted, CSSColor } from '../../../constants'

type DashLineProps = Readonly<{
  /** 点線の始点のx, y座標 */
  x1: number
  y1: number
  /** 点線の終点のx, y座標 */
  x2: number
  y2: number
  /** 点線の幅 */
  strokeWidth: number
  /** 点線の間隔のスケール */
  dashScale?: number
  /** 始点と終点の先まで点線を延長して描画するかどうか */
  isInfinityLine?: boolean
  /** true: 一点鎖線を描画, false: 通常の点線を描画 */
  isDotDash?: boolean
  /** 点線の色 */
  color?: CSSColor
}>

/**
 * 点線を描画するコンポーネント
 */
const DashLine: React.FC<DashLineProps> = ({
  x1,
  y1,
  x2,
  y2,
  strokeWidth,
  dashScale = undefined,
  isInfinityLine = false,
  isDotDash = true,
  color = colorMuted,
}) => {
  const derivedDashScale = dashScale === undefined ? strokeWidth : dashScale
  const strokeDasharray = (isDotDash ? [4, 2, 2, 2] : [2, 2, 2, 2])
    .map((n) => n * derivedDashScale)
    .join(' ')
  const stroke = typeof color === 'undefined' ? colorMuted : color
  if (!isInfinityLine) {
    return (
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={stroke}
        strokeDasharray={strokeDasharray}
        strokeWidth={strokeWidth}
      />
    )
  }

  const len = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
  if (len === 0) {
    return null
  }
  const vx = (x1 - x2) / len
  const vy = (y1 - y2) / len
  return (
    <line
      x1={x1 + vx * INFINITY}
      y1={y1 + vy * INFINITY}
      x2={x1 - vx * INFINITY}
      y2={y1 - vy * INFINITY}
      stroke={stroke}
      strokeDasharray={strokeDasharray}
      strokeWidth={strokeWidth}
    />
  )
}

export default React.memo(DashLine)
