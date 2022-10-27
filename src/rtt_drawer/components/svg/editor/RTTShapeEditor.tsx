import React, { ReactNode, useState } from 'react'
import { Matrix } from 'transformation-matrix'
import { DrawLayer, SelectionLayer } from '../../../../../modules/react-shape-editor/dist'
import { ShapeId } from '../../../../../modules/react-shape-editor/dist/types'
import { GenbaKeyType } from '../../../../common/types'
import { replaceEditorShapes } from '../../../actions'
import { SHAPE_CONSTRAIN_KEY, Corners, EditorShapeId, ZUMEN, INFINITY } from '../../../constants'
import { ClearTransContext, MovingCornersContext, useSubKeyPress } from '../../../hooks'
import { EditorState } from '../../../reducers'
import { arrayReplace, generateId, makeConstrainResize } from '../../../utils'
import ShapeEditorContexts from './ShapeEditorContexts'
import { getShapeComponentFromKind, Shapes } from './shapes'

/** 図形編集の検知範囲 */
const EDITOR_SIZE = INFINITY
const SHAPE_ID_PREFIX = '@rtt-drawer/shape-'

const generateShapeId = (): ShapeId => `${SHAPE_ID_PREFIX}${generateId()}`

type RTTShapeEditorProps = Readonly<{
  genbaKey: GenbaKeyType
  zumenType: ZUMEN
  editor: EditorState
  clearTrans: Matrix
  onEditorShapesReplace: typeof replaceEditorShapes
  children: ReactNode
}>

const RTTShapeEditor: React.FC<RTTShapeEditorProps> = ({
  children,
  genbaKey,
  zumenType,
  editor,
  clearTrans,
  onEditorShapesReplace,
}) => {
  const [selectedShapeIds, setSelectedShapeIds] = useState<EditorShapeId[]>([])
  const [movingCorners, setMovingCorners] = useState<Corners>({
    start: { x: 0, y: 0 },
    end: { x: 0, y: 0 },
  })

  const getAltKeyPressed = useSubKeyPress(SHAPE_CONSTRAIN_KEY)

  const { tool, shapes } = editor

  const constrainResize = tool ? makeConstrainResize(tool, getAltKeyPressed) : undefined

  return (
    <ClearTransContext.Provider value={clearTrans}>
      <MovingCornersContext.Provider value={movingCorners}>
        <ShapeEditorContexts
          vectorWidth={EDITOR_SIZE}
          vectorHeight={EDITOR_SIZE}
          padding={EDITOR_SIZE}
          focusOnAdd={false}
          focusOnDelete={false}
        >
          <SelectionLayer
            selectedShapeIds={selectedShapeIds}
            onSelectionChange={(ids) => setSelectedShapeIds(ids)}
            keyboardTransformMultiplier={5}
            onChange={(newRects, selectedShapesProps) => {
              onEditorShapesReplace({
                genbaKey,
                zumenType,
                shapes: newRects.reduce((acc, newRect, index) => {
                  const { shapeId } = selectedShapesProps[index]
                  const shapeIndex = acc.findIndex((shape) => shape.id === shapeId)
                  if (shapeIndex === -1) {
                    throw new Error(`変数の値が不正です。 shapeId: ${shapeId}`)
                  }
                  const item = acc[shapeIndex]
                  return arrayReplace(acc, shapeIndex, [
                    {
                      ...item,
                      ...newRect,
                    },
                  ])
                }, shapes),
              })
            }}
            onDelete={(_event, selectedShapesProps) => {
              onEditorShapesReplace({
                genbaKey,
                zumenType,
                shapes: selectedShapesProps
                  .map((p) => shapes.findIndex((shape) => shape.id === p.shapeId))
                  // Delete the indices in reverse so as not to shift the
                  // other array elements and screw up the array indices
                  .sort((a, b) => b - a)
                  .reduce((acc, shapeIndex) => arrayReplace(acc, shapeIndex, []), shapes),
              })
            }}
          >
            {children}
            <Shapes
              genbaKey={genbaKey}
              zumenType={zumenType}
              shapes={shapes}
              selectedShapeIds={selectedShapeIds}
              onEditorShapesReplace={onEditorShapesReplace}
            />
            {tool ? (
              <DrawLayer
                // Since the DrawLayer is a child of the SelectionLayer, it
                // receives click events before the SelectionLayer, and so
                // click-and-drag results in drawing
                DrawPreviewComponent={getShapeComponentFromKind(tool)}
                onAddShape={({ x, y, width, height }) => {
                  const inverted = {
                    x: movingCorners.start.x <= movingCorners.end.x,
                    y: movingCorners.start.y <= movingCorners.end.y,
                  }
                  onEditorShapesReplace({
                    genbaKey,
                    zumenType,
                    shapes: [
                      ...shapes,
                      {
                        id: generateShapeId(),
                        kind: tool,
                        x,
                        y,
                        width,
                        height,
                        inverted,
                      },
                    ],
                  })
                }}
                onDraw={({ startCorner: start, movingCorner: end }) => {
                  setMovingCorners({ start, end })
                }}
                onDrawStart={({ startCorner: start }) => {
                  setMovingCorners({ start, end: start })
                }}
                constrainResize={constrainResize}
              />
            ) : null}
          </SelectionLayer>
        </ShapeEditorContexts>
      </MovingCornersContext.Provider>
    </ClearTransContext.Provider>
  )
}

export default RTTShapeEditor
