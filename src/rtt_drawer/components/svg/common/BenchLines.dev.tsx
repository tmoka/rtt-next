/* eslint-disable react/jsx-props-no-spreading */
import React from 'react'
import { DEFAULT_STROKE_WIDTH } from '../../../constants'

const defaultLineColor = '#FFCCFF'

type BenchLinesProps = Readonly<{
  width?: number
  height?: number
  intervalX?: number
  intervalY?: number
  strokeWidth?: number
  lineProps?: React.SVGProps<SVGLineElement>
}>

const BenchLines: React.FC<BenchLinesProps> = ({
  width = 800,
  height = 600,
  intervalX = 100,
  intervalY = 100,
  strokeWidth = DEFAULT_STROKE_WIDTH,
  lineProps = {},
}) => {
  const lines = []
  for (let x = 0; x <= width; x += intervalX) {
    lines.push(
      <line
        key={`x_${x}`}
        x1={x}
        x2={x}
        y1={0}
        y2={height}
        stroke={defaultLineColor}
        strokeWidth={strokeWidth}
        {...lineProps}
      />,
    )
  }
  for (let y = 0; y <= height; y += intervalY) {
    lines.push(
      <line
        key={`y_${y}`}
        x1={0}
        x2={width}
        y1={y}
        y2={y}
        stroke={defaultLineColor}
        strokeWidth={strokeWidth}
        {...lineProps}
      />,
    )
  }
  return <g>{lines}</g>
}

export default React.memo(BenchLines)
