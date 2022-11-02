import React from 'react'
import { Matrix } from 'transformation-matrix'
import SVGLayer from './SVGLayer'

const defaultTextColor = '#FFCCFF'

type BenchNumsProps = Readonly<{
  width: number
  height: number
  numIntervalX: number
  numIntervalY: number
  textProps: React.SVGProps<SVGTextElement>
  clearTrans: Matrix
}>

const BenchNums: React.FC<BenchNumsProps> = ({
  width,
  height,
  numIntervalX,
  numIntervalY,
  textProps,
  clearTrans,
}) => {
  const nums = []
  for (let x = 0; x <= width; x += numIntervalX) {
    nums.push(
      <SVGLayer
        id={`svg_layer_x_0_${x}`}
        x={x}
        y={0}
        transformMat={clearTrans}
        clip={false}
        key={`x_0_${x}`}
      >
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <text fill={defaultTextColor} {...textProps}>
          {x}
        </text>
      </SVGLayer>,
      <SVGLayer
        id={`svg_layer_x_h_${x}`}
        x={x}
        y={height}
        transformMat={clearTrans}
        clip={false}
        key={`x_h_${x}`}
      >
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <text fill={defaultTextColor} {...textProps}>
          {x}
        </text>
      </SVGLayer>,
    )
  }
  for (let y = 0; y <= height; y += numIntervalY) {
    nums.push(
      <SVGLayer
        id={`svg_layer_0_y_${y}`}
        x={0}
        y={y}
        transformMat={clearTrans}
        clip={false}
        key={`0_y_${y}`}
      >
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <text fill={defaultTextColor} {...textProps}>
          {y}
        </text>
      </SVGLayer>,
      <SVGLayer
        id={`svg_layer_w_y_${y}`}
        x={width}
        y={y}
        transformMat={clearTrans}
        clip={false}
        key={`w_y_${y}`}
      >
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <text fill={defaultTextColor} {...textProps}>
          {y}
        </text>
      </SVGLayer>,
    )
  }
  return <g>{nums}</g>
}

export default React.memo(BenchNums)
