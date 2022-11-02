/**
 * 図形編集のイベント処理を行うコンポーネント
 *
 * https://github.com/fritz-c/react-shape-editor/blob/v3.5.3/src/ShapeEditor.tsx
 * をもとに作成
 */

import React, { ReactNode, useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { applyToPoint, identity, inverse, Matrix } from 'transformation-matrix'
import {
  EventEmitter,
  EventType,
  useAdditionalListener,
  useNewEventEmitter,
} from '../../../../../modules/react-shape-editor/dist/EventEmitter'
import { useIsMountedRef, useUpdatingRef } from '../../../../../modules/react-shape-editor/dist/hooks'
import { Point, Rectangle, ShapeActions } from '../../../../../modules/react-shape-editor/dist/types'
import {
  CoordinateGetterRefProvider,
  DimensionsProvider,
  EventEmitterProvider,
} from '../../../../../modules/react-shape-editor/dist/useRootContext'
import { XYPointObject } from '../../../constants'

// @types/react のバージョンの違いを吸収するための定義
type ShapeEditorMouseEvent = { clientX: number; clientY: number }

const useMouseEventForwarding = (eventEmitter: EventEmitter): void => {
  useEffect(() => {
    const onMouseEvent = (event: MouseEvent): void => {
      eventEmitter.emit(EventType.MouseEvent, event)
    }

    window.addEventListener('mouseup', onMouseEvent)
    window.addEventListener('mousemove', onMouseEvent)

    return () => {
      window.removeEventListener('mouseup', onMouseEvent)
      window.removeEventListener('mousemove', onMouseEvent)
    }
  }, [eventEmitter])
}

const useChildAddDeleteHandler = (
  focusOnAdd: boolean,
  focusOnDelete: boolean,
): ((shapeActionsRef: React.MutableRefObject<ShapeActions>, didMount: boolean) => void) => {
  type ShapeActionRef = React.MutableRefObject<ShapeActions>
  const justAddedShapeActionRefsRef = useRef([] as ShapeActionRef[])
  const wrappedShapeActionRefsRef = useRef([] as ShapeActionRef[])
  const lastDeletedRectRef = useRef(null as Rectangle | null)

  useLayoutEffect(() => {
    if (justAddedShapeActionRefsRef.current.length > 0 && focusOnAdd) {
      // Focus on shapes added since the last update
      justAddedShapeActionRefsRef.current.slice(-1)[0].current.forceFocus()
    } else if (lastDeletedRectRef.current && focusOnDelete) {
      // If something was deleted since the last update, focus on the
      // next closest shape by center coordinates
      const getShapeCenter = (shape: Rectangle): { x: number; y: number } => ({
        x: shape.x + shape.width / 2,
        y: shape.y + shape.height / 2,
      })
      const deletedShapeCenter = getShapeCenter(lastDeletedRectRef.current)

      let closestDistance = 2 ** 53 - 1
      let closestShapeActions: ShapeActions | null = null
      wrappedShapeActionRefsRef.current.forEach((shapeActionRef) => {
        const shapeCenter = getShapeCenter(shapeActionRef.current.props)
        const distance =
          (deletedShapeCenter.x - shapeCenter.x) ** 2 + (deletedShapeCenter.y - shapeCenter.y) ** 2
        if (distance < closestDistance) {
          closestDistance = distance
          closestShapeActions = shapeActionRef.current
        }
      })

      if (closestShapeActions !== null) {
        ; (closestShapeActions as ShapeActions).forceFocus()
      }
    }

    justAddedShapeActionRefsRef.current = []
    lastDeletedRectRef.current = null
  })

  const editorMountedRef = useIsMountedRef()

  const onShapeMountedOrUnmounted = (
    shapeActionsRef: React.MutableRefObject<ShapeActions>,
    didMount: boolean,
  ): void => {
    if (didMount) {
      // Only monitor shapes added after the initial editor render
      if (editorMountedRef.current) {
        justAddedShapeActionRefsRef.current = [
          ...justAddedShapeActionRefsRef.current,
          shapeActionsRef,
        ]
      }

      wrappedShapeActionRefsRef.current = [...wrappedShapeActionRefsRef.current, shapeActionsRef]
    } else {
      const { x, y, width, height } = shapeActionsRef.current.props
      lastDeletedRectRef.current = { x, y, width, height }
      wrappedShapeActionRefsRef.current = wrappedShapeActionRefsRef.current.filter(
        (s) => s !== shapeActionsRef,
      )
    }
  }

  return onShapeMountedOrUnmounted
}

type ShapeEditorContextsProps = Readonly<{
  focusOnAdd?: boolean
  focusOnDelete?: boolean
  padding?: number | { top?: number; right?: number; bottom?: number; left?: number }
  scale?: number
  style?: React.CSSProperties
  // TODOv4: Remove vectorHeight/vectorWidth/children defaults, and make required
  vectorHeight?: number
  vectorWidth?: number
  children: ReactNode
}>

const ShapeEditorContexts: React.FC<ShapeEditorContextsProps> = ({
  children,
  focusOnAdd = true,
  focusOnDelete = true,
  scale = 1,
  vectorHeight = 0,
  vectorWidth = 0,
  padding = 0,
}) => {
  const {
    top: paddingTop,
    right: paddingRight,
    bottom: paddingBottom,
    left: paddingLeft,
  } = typeof padding === 'number'
      ? {
        top: padding,
        right: padding,
        bottom: padding,
        left: padding,
      }
      : {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        ...padding,
      }

  const svgElRef = useRef<SVGGElement>(null)

  /**
   * screen 座標から current 座標への座標変換行列を求める
   * @returns 座標変換行列
   */
  const getCurrentCTM = useCallback((): Matrix | null => {
    const ref = svgElRef.current
    if (!ref) {
      // 未だ初期化が終わっていない時
      return null
    }
    return ref.getScreenCTM()
  }, [])

  /**
   * event が起きた screen 座標を取得し、current 座標に変換する
   * @param event
   * @returns current座標
   */
  const getCurrentXY = useCallback(
    (event: ShapeEditorMouseEvent): XYPointObject => {
      const { clientX, clientY } = event
      // screen -> current の変換を行う変換行列
      const mat = inverse(getCurrentCTM() || identity())
      const point = applyToPoint(mat, { x: clientX, y: clientY })
      return point
    },
    [getCurrentCTM],
  )

  const getVectorCoordinatesFromMouseEventRef = useUpdatingRef(
    (
      event: ShapeEditorMouseEvent,
      { x: offsetX = 0, y: offsetY = 0 }: { x?: number; y?: number } = {},
    ): Point => {
      const { x, y } = getCurrentXY(event)
      return { x: x - offsetX, y: y - offsetY }
    },
  )

  const onShapeMountedOrUnmounted = useChildAddDeleteHandler(focusOnAdd, focusOnDelete)

  const eventEmitter = useNewEventEmitter()
  useMouseEventForwarding(eventEmitter)
  useAdditionalListener(eventEmitter, EventType.MountedOrUnmounted, onShapeMountedOrUnmounted)

  const vectorPaddingTop = paddingTop / scale
  const vectorPaddingRight = paddingRight / scale
  const vectorPaddingBottom = paddingBottom / scale
  const vectorPaddingLeft = paddingLeft / scale

  return (
    <g
      width={vectorWidth * scale + paddingLeft + paddingRight}
      height={vectorHeight * scale + paddingTop + paddingBottom}
      preserveAspectRatio='xMinYMin'
      // viewBox={[
      //   -vectorPaddingLeft,
      //   -vectorPaddingTop,
      //   vectorWidth + vectorPaddingLeft + vectorPaddingRight,
      //   vectorHeight + vectorPaddingTop + vectorPaddingBottom,
      // ].join(' ')}
      ref={svgElRef}
      style={{
        userSelect: 'none',
      }}
      // IE11 - prevent all elements from being focusable by default
      focusable='false'
    >
      <CoordinateGetterRefProvider value={getVectorCoordinatesFromMouseEventRef}>
        <EventEmitterProvider value={eventEmitter}>
          <DimensionsProvider
            value={{
              vectorWidth,
              vectorHeight,
              vectorPaddingTop,
              vectorPaddingRight,
              vectorPaddingBottom,
              vectorPaddingLeft,
              scale,
            }}
          >
            {children}
          </DimensionsProvider>
        </EventEmitterProvider>
      </CoordinateGetterRefProvider>
    </g>
  )
}

export default ShapeEditorContexts
