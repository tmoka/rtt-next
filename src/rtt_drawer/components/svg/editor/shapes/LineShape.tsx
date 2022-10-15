import React from 'react'
import {
  SHAPE_STROKE,
  SHAPE_STROKE_DISABLED,
  SHAPE_STROKE_WIDTH_SCALE,
} from '../../../../constants'
import { useMovingCornersContext, useStrokeWidth } from '../../../../hooks'
import { wrapShapeExtra } from '../../../../utils'

/** 図形（直線） */
export const LineShape = wrapShapeExtra(
  React.memo(({ width, height, inverted = {}, disabled }) => {
    const movingCorners = useMovingCornersContext()
    const realInverted = disabled
      ? {
          // 描画途中のとき
          x: movingCorners.start.x > movingCorners.end.x,
          y: movingCorners.start.y > movingCorners.end.y,
        }
      : inverted
    const strokeWidth = useStrokeWidth() * SHAPE_STROKE_WIDTH_SCALE
    return (
      <line
        x1={realInverted.x ? width : 0}
        y1={realInverted.y ? height : 0}
        x2={realInverted.x ? 0 : width}
        y2={realInverted.y ? 0 : height}
        stroke={disabled ? SHAPE_STROKE_DISABLED : SHAPE_STROKE}
        strokeWidth={strokeWidth}
        data-tid='line-shape'
      />
    )
  }),
)

export default LineShape
