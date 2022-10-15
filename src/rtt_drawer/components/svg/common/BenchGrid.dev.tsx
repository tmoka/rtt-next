import React from 'react'
import { identity, Matrix } from 'transformation-matrix'
import BenchLines from './BenchLines.dev'
import BenchNums from './BenchNums.dev'
import { DEFAULT_STROKE_WIDTH } from '../../../constants'

export type BenchGridProps = Readonly<{
  width?: number
  height?: number
  intervalX?: number
  intervalY?: number
  numIntervalX?: number
  numIntervalY?: number
  strokeWidth?: number
  lineProps?: React.SVGProps<SVGLineElement>
  textProps?: React.SVGProps<SVGTextElement>
  clearTrans?: Matrix
}>

const BenchGrid: React.FC<BenchGridProps> = ({
  width = 800,
  height = 600,
  intervalX = 100,
  intervalY = 100,
  numIntervalX = intervalX,
  numIntervalY = intervalY,
  strokeWidth = DEFAULT_STROKE_WIDTH,
  lineProps = {},
  textProps = {},
  clearTrans = identity(),
}) => {
  return (
    <g>
      <BenchLines
        width={width}
        height={height}
        intervalX={intervalX}
        intervalY={intervalY}
        strokeWidth={strokeWidth}
        lineProps={lineProps}
      />
      <BenchNums
        width={width}
        height={height}
        numIntervalX={numIntervalX}
        numIntervalY={numIntervalY}
        textProps={textProps}
        clearTrans={clearTrans}
      />
    </g>
  )
}

export default React.memo(BenchGrid)
