import React from 'react'
import { ResizeHandleComponentType } from '@/react-shape-editor/dist/types'
import { useClearTransContext } from '../../../../hooks'
import SVGLayer from '../../common/SVGLayer'

/** リサイズ用のハンドラ（小さい四角） */
const ResizeHandleComponent: ResizeHandleComponentType = ({
  active,
  cursor,
  isInSelectionGroup,
  onMouseDown,
  recommendedSize,
  scale,
  x,
  y,
}) => {
  const clearTrans = useClearTransContext()
  if (!active) {
    return null
  }
  return (
    <SVGLayer x={x} y={y} transformMat={clearTrans} clip={false}>
      <rect
        fill='rgba(229,240,244,1)'
        height={recommendedSize}
        stroke='rgba(53,33,140,1)'
        strokeWidth={1 / scale}
        style={{ cursor, opacity: isInSelectionGroup ? 0 : 1 }}
        width={recommendedSize}
        x={-recommendedSize / 2}
        y={-recommendedSize / 2}
        // The onMouseDown prop must be passed on or resize will not work
        onMouseDown={onMouseDown}
      />
    </SVGLayer>
  )
}

export default ResizeHandleComponent
