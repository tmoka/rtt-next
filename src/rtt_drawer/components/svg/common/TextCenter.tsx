import React, { ReactNode } from 'react'

type TextCenterProps = Readonly<{
  x?: number
  y?: number
  children: ReactNode
}>

/**
 * 縦横ともに中央揃えで文字列を表示するコンポーネント
 */
const TextCenter: React.FC<TextCenterProps> = ({ x, y, children }) => (
  <text x={x} y={y} dominantBaseline='central' textAnchor='middle'>
    {children}
  </text>
)

export default TextCenter
