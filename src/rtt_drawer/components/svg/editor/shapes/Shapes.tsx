import React, { useState } from 'react'
import {
  ConstrainMoveFunc,
  Rectangle,
  WrappedShapeProps,
} from '../../../../../../modules/react-shape-editor/dist/types'
import { GenbaKeyType } from '../../../../../common/types'
import { replaceEditorShapes } from '../../../../actions'
import {
  SHAPE_CONSTRAIN_KEY,
  EditorShape,
  EditorShapeId,
  EditorShapeKind,
  ExtraShapeProps,
  InvertedState,
  ZUMEN,
} from '../../../../constants'
import { useSubKeyPress } from '../../../../hooks'
import { arrayReplace, makeConstrainResize } from '../../../../utils'
import { LineShape } from './LineShape'
import { RectShape } from './RectShape'
import ResizeHandleComponent from './ResizeHandleComponent'

/**
 * 図形が編集中に反転したかどうかを判断する
 *
 * @param prevRect - 前回の図形の位置
 * @param rect - 現在の図形の位置
 * @returns 新たに図形が反転したかどうか
 */
const isInverted = (prevRect: Rectangle, rect: Rectangle): InvertedState => {
  if (prevRect.width === rect.width && prevRect.height === rect.height) {
    return {}
  }
  return {
    x: prevRect.x !== rect.x && prevRect.x + prevRect.width !== rect.x + rect.width,
    y: prevRect.y !== rect.y && prevRect.y + prevRect.height !== rect.y + rect.height,
  }
}

/** 図形の種類に対応する図形 component を返す */
export const getShapeComponentFromKind = (
  kind: EditorShapeKind,
): React.FC<WrappedShapeProps & ExtraShapeProps> => {
  switch (kind) {
    case EditorShapeKind.RECT:
      return RectShape
    case EditorShapeKind.LINE:
      return LineShape
    default:
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`変数の値が不正です。 kind: ${kind}`)
  }
}

type ShapesProps = Readonly<{
  genbaKey: GenbaKeyType
  zumenType: ZUMEN
  shapes: EditorShape[]
  selectedShapeIds: EditorShapeId[]
  onEditorShapesReplace: typeof replaceEditorShapes
}>

export const Shapes: React.FC<ShapesProps> = ({
  genbaKey,
  zumenType,
  shapes,
  selectedShapeIds,
  onEditorShapesReplace,
}) => {
  const [idToInverted, setIdToInverted] = useState<{
    [id: string]: InvertedState | undefined
  }>({})

  const getAltKeyPressed = useSubKeyPress(SHAPE_CONSTRAIN_KEY)

  const shapeElements = shapes.map((shape, index) => {
    const { id, kind, height, width, x, y, inverted = {} } = shape

    const intermediateInverted = idToInverted[id] || {}
    const realInverted = {
      x: !!inverted.x !== !!intermediateInverted.x,
      y: !!inverted.y !== !!intermediateInverted.y,
    }

    const isActive = selectedShapeIds.indexOf(id) >= 0

    const handleChange = (newRect: Rectangle): void => {
      setIdToInverted({ ...idToInverted, [id]: undefined })
      onEditorShapesReplace({
        genbaKey,
        zumenType,
        shapes: arrayReplace(shapes, index, [
          {
            ...newRect,
            id,
            kind,
            inverted: realInverted,
          },
        ]),
      })
    }

    const handleIntermediateChange = (intermediateRect: Rectangle): void => {
      const nextInverted = isInverted(shape, intermediateRect)
      if (
        !!intermediateInverted.x !== !!nextInverted.x ||
        !!intermediateInverted.y !== !!nextInverted.y
      ) {
        setIdToInverted({ ...idToInverted, [id]: nextInverted })
      }
    }

    const handleDelete = (): void => {
      onEditorShapesReplace({
        genbaKey,
        zumenType,
        shapes: arrayReplace(shapes, index, []),
      })
    }

    const constrainMove: ConstrainMoveFunc = ({ x: movingX, y: movingY }) => {
      if (!getAltKeyPressed()) {
        return { x: movingX, y: movingY } // 制限なし
      }
      // x or y 方向に制限する
      if (Math.abs(movingX - x) <= Math.abs(movingY - y)) {
        return { x, y: movingY }
      }
      return { x: movingX, y }
    }

    const ShapeComponent = getShapeComponentFromKind(kind)
    return (
      <ShapeComponent
        key={id}
        active={isActive}
        shapeId={id}
        height={height}
        width={width}
        x={x}
        y={y}
        onChange={handleChange}
        onDelete={handleDelete}
        onIntermediateChange={handleIntermediateChange}
        constrainMove={constrainMove}
        constrainResize={makeConstrainResize(kind, getAltKeyPressed)}
        ResizeHandleComponent={ResizeHandleComponent}
        inverted={realInverted}
      />
    )
  })

  return <>{shapeElements}</>
}
