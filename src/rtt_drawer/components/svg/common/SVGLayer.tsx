import React from 'react'
import { identity, translate, transform, toSVG, Matrix } from 'transformation-matrix'
import ClipRect from './ClipRect'

type SVGLayerProps = Readonly<{
  // SVG内で一意なid。SVGの `<clipPath>` を識別するために使う。
  // 参考: https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Clipping_and_masking
  id?: string
  x?: number
  y?: number
  width?: number
  height?: number
  transformMat?: Matrix
  clip?: boolean
  children?: React.ReactNode
}>

/**
 * 以下の2つの機能を持つコンポーネント。
 *  - transformMat で与えられた座標変換を行う
 *  - x座標: x 〜 x + width, y座標: y 〜 y + height の長方形領域からはみ出た部分を非表示にする
 *
 * ただし、 props.clip が false のときは座標変換のみ行う。
 */
const SVGLayer: React.FC<SVGLayerProps> = ({
  id = '',
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  transformMat = identity(),
  clip = true,
  children = null,
}) => {
  const innerTransformMat = transform(translate(x, y), transformMat)
  const transformG = <g transform={toSVG(innerTransformMat)}>{children}</g>
  if (!clip) {
    return transformG
  }
  return (
    <ClipRect id={id} x={x} y={y} width={width} height={height}>
      {transformG}
    </ClipRect>
  )
}

export default SVGLayer
