import React from 'react'
import {
  SHAPE_STROKE,
  SHAPE_STROKE_DISABLED,
  SHAPE_STROKE_WIDTH_SCALE,
} from '../../../../constants'
import { useStrokeWidth } from '../../../../hooks'
import { wrapShapeExtra } from '../../../../utils'

/** 図形（長方形） */
export const RectShape = wrapShapeExtra(
  React.memo(({ width, height, disabled }) => {
    const strokeWidth = useStrokeWidth() * SHAPE_STROKE_WIDTH_SCALE
    return (
      <rect
        width={width}
        height={height}
        fill='none'
        stroke={disabled ? SHAPE_STROKE_DISABLED : SHAPE_STROKE}
        strokeWidth={strokeWidth}
        data-tid='rect-shape'
      />
    )
  }),
)
