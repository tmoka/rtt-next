import React, { createRef } from 'react'
import { inverse, applyToPoint, identity, Matrix } from 'transformation-matrix'
import throttle from 'lodash/throttle'
import { MOUSE_WHEEL_EVENT, initialMapState, MapState, XYPointObject } from '../../constants'
import { scale2zoom, calcZoomAround, isInsideSVG } from '../../utils'
import { updateMapState } from '../../actions'

const SCROLL_PIXELS_FOR_ZOOM_LEVEL = 150
const CLICK_TOLERANCE = 2
const DOUBLE_CLICK_DELAY = 300
const THROTTLE_INTERVAL = 80

type SVGMapProps = Readonly<{
  rootCoordRef: React.RefObject<SVGGElement> | null
  /** root 座標系からの画像の移動量を表す object */
  mapState: MapState
  innerScale: number
  /** root -> screen の変換を行う変換行列を取得する関数 */
  getRootCTM: () => Matrix | null
  children: React.ReactNode
  /** SVGMap 上でのコントロールを無効化するかどうか */
  isMoveDisabled?: boolean
  onMapStateChange?: typeof updateMapState | null
  onClick?: ((event: MouseEvent, rootXY: XYPointObject) => void) | null
}>

/**
 * ドラッグやピンチによって svg が移動、拡大/縮小する量を計算するコンポーネント。
 * pigeon-maps という地図描画 component を参考に、UI に関する部分を抽出している。
 * https://github.com/mariusandra/pigeon-maps
 */
class SVGMap extends React.Component<SVGMapProps, {}> {
  /** SVGMap 自身を指す */
  private mapRef = createRef<SVGGElement>()

  /** root 座標系でのマウスの座標 */
  private mouseRootXY: XYPointObject | null = null

  /** current 座標系でのマウスの座標 */
  private mouseCurrentXY: XYPointObject | null = null

  /** 直前に処理したマウスドラッグの root 座標 */
  private prevDragRootXY: XYPointObject | null = null

  /** 直前に処理したマウスドラッグの screen 座標 */
  private prevDragScreenXY: XYPointObject | null = null

  /** 直前に処理したタッチドラッグの root 座標 */
  private prevTouchRootXYs: XYPointObject[] | null = null

  /** 直前に処理したピンチの2本の指の中心の root 座標 */
  private prevTouchMidRootXY: XYPointObject | null = null

  /** 直前に処理したピンチの2本の指の screen 座標上での距離 */
  private prevTouchScreenDistance: number | null = null

  /** マウスホイールの回転量の蓄積 */
  private wheelDeltaYCummulated = 0

  /** 現在マウスが押下されているかどうか */
  private mouseDown = false

  /** 前回クリックした時刻 */
  private lastClick: number | null = null

  /** 前回タップした時刻 */
  private lastTap: number | null = null

  private handleMouseMove = throttle((event: MouseEvent): void => {
    const { isMoveDisabled } = this.props
    if (isMoveDisabled) {
      return
    }

    this.mouseRootXY = this.getRootXY(event)
    this.mouseCurrentXY = this.getCurrentXY(event)

    if (this.mouseDown && this.prevDragRootXY) {
      const { mapState } = this.props
      const { rootOffset, zoom } = mapState

      this.handleMapStateChange({
        rootOffset: {
          x: rootOffset.x + this.mouseRootXY.x - this.prevDragRootXY.x,
          y: rootOffset.y + this.mouseRootXY.y - this.prevDragRootXY.y,
        },
        zoom,
      })
      this.updateDragCoods(event)
    }
  }, THROTTLE_INTERVAL)

  private handleTouchMove = throttle((event: TouchEvent): void => {
    const { isMoveDisabled } = this.props
    if (isMoveDisabled) {
      return
    }

    const { mapState, innerScale } = this.props
    const { rootOffset, zoom } = mapState
    if (event.touches.length === 1 && this.prevTouchRootXYs) {
      event.preventDefault()
      const rootXY = this.getRootXY(event.touches[0])

      this.handleMapStateChange({
        rootOffset: {
          x: rootOffset.x + rootXY.x - this.prevTouchRootXYs[0].x,
          y: rootOffset.y + rootXY.y - this.prevTouchRootXYs[0].y,
        },
        zoom,
      })
      this.updateTouchCoords(event)
    } else if (
      event.touches.length === 2 &&
      this.prevTouchScreenDistance !== null &&
      this.prevTouchMidRootXY
    ) {
      // ピンチ中の場合
      event.preventDefault()

      const t1 = event.touches[0]
      const t2 = event.touches[1]
      const t1rootXY = this.getRootXY(t1)
      const t2rootXY = this.getRootXY(t2)
      const t1currentXY = this.getCurrentXY(t1)
      const t2currentXY = this.getCurrentXY(t2)

      const midRootXY = {
        x: (t1rootXY.x + t2rootXY.x) / 2,
        y: (t1rootXY.y + t2rootXY.y) / 2,
      }
      const midCurrentXY = {
        x: (t1currentXY.x + t2currentXY.x) / 2,
        y: (t1currentXY.y + t2currentXY.y) / 2,
      }
      const distance = Math.sqrt((t1.clientX - t2.clientX) ** 2 + (t1.clientY - t2.clientY) ** 2)
      const zoomDiff = scale2zoom(distance / this.prevTouchScreenDistance)

      const nextMapState = calcZoomAround(midCurrentXY, zoomDiff, { rootOffset, zoom }, innerScale)
      if (nextMapState) {
        this.handleMapStateChange({
          rootOffset: {
            x: nextMapState.rootOffset.x + midRootXY.x - this.prevTouchMidRootXY.x,
            y: nextMapState.rootOffset.y + midRootXY.y - this.prevTouchMidRootXY.y,
          },
          zoom: nextMapState.zoom,
        })
      }
      this.updateTouchCoords(event)
    }
  }, THROTTLE_INTERVAL)

  private handleWheelInner = throttle((): void => {
    const deltaZoom = -this.wheelDeltaYCummulated / SCROLL_PIXELS_FOR_ZOOM_LEVEL
    this.wheelDeltaYCummulated = 0
    if (this.mouseCurrentXY) {
      this.zoomAroundMouse(this.mouseCurrentXY, deltaZoom)
    }
  }, THROTTLE_INTERVAL)

  // eslint-disable-next-line react/static-property-placement
  public static defaultProps: Partial<SVGMapProps> = {
    mapState: initialMapState,
    children: null,
    onMapStateChange: null,
    onClick: null,
  }

  public componentDidMount(): void {
    this.bindEvents()

    // turbolinks有効時に後処理を呼べるようにする
    window.addEventListener('beforeunload', this.unbindEvents)
    window.addEventListener('turbolinks:before-render', this.unbindEvents)
  }

  public componentWillUnmount(): void {
    this.unbindEvents()

    // turbolinks有効時に後処理を呼べるようにする
    window.removeEventListener('beforeunload', this.unbindEvents)
    window.removeEventListener('turbolinks:before-render', this.unbindEvents)
  }

  /**
   * screen 座標から current 座標への座標変換行列を求める
   * @returns 座標変換行列
   */
  public getCurrentCTM = (): Matrix | null => {
    const ref = this.mapRef.current
    if (!ref) {
      // 未だ初期化が終わっていない時
      return null
    }
    return ref.getScreenCTM()
  }

  /**
   * event が起きた screen 座標を取得し、root 座標に変換する
   * @param event
   * @returns root座標
   */
  private getRootXY(event: MouseEvent | Touch): XYPointObject {
    const { getRootCTM } = this.props
    const { clientX, clientY } = event
    // screen -> root の変換を行う変換行列
    const mat = inverse(getRootCTM() || identity())
    const point = applyToPoint(mat, { x: clientX, y: clientY })
    return point
  }

  /**
   * event が起きた screen 座標を取得し、current 座標に変換する
   * @param event
   * @returns current座標
   */
  private getCurrentXY(event: MouseEvent | Touch): XYPointObject {
    const { clientX, clientY } = event
    // screen -> current の変換を行う変換行列
    const mat = inverse(this.getCurrentCTM() || identity())
    const point = applyToPoint(mat, { x: clientX, y: clientY })
    return point
  }

  private bindEvents = (): void => {
    window.addEventListener('mousedown', this.handleMouseDown)
    window.addEventListener('mouseup', this.handleMouseUp)
    window.addEventListener('mousemove', this.handleMouseMove)
    window.addEventListener(MOUSE_WHEEL_EVENT, this.handleWheel, {
      passive: false,
    })
    window.addEventListener('touchstart', this.handleTouchStart, {
      passive: false,
    })
    window.addEventListener('touchmove', this.handleTouchMove, {
      passive: false,
    })
    window.addEventListener('touchend', this.handleTouchEnd, {
      passive: false,
    })
  }

  private unbindEvents = (): void => {
    window.removeEventListener('mousedown', this.handleMouseDown)
    window.removeEventListener('mouseup', this.handleMouseUp)
    window.removeEventListener('mousemove', this.handleMouseMove)
    window.removeEventListener(MOUSE_WHEEL_EVENT, this.handleWheel)
    window.removeEventListener('touchstart', this.handleTouchStart)
    window.removeEventListener('touchmove', this.handleTouchMove)
    window.removeEventListener('touchend', this.handleTouchEnd)
  }

  private handleMouseDown = (event: MouseEvent): void => {
    const { isMoveDisabled } = this.props
    if (isMoveDisabled) {
      return
    }

    const { rootCoordRef } = this.props
    this.mouseRootXY = this.getRootXY(event)
    this.mouseCurrentXY = this.getCurrentXY(event)

    if (event.button === 0 && isInsideSVG(event, rootCoordRef)) {
      event.preventDefault()

      if (this.lastClick && window.performance.now() - this.lastClick < DOUBLE_CLICK_DELAY) {
        // double click
        this.handleMapStateChange(initialMapState)
      } else {
        this.lastClick = window.performance.now()
        this.mouseDown = true
        this.updateDragCoods(event)
      }
    }
  }

  private handleMouseUp = (event: MouseEvent): void => {
    const { isMoveDisabled } = this.props
    if (isMoveDisabled) {
      return
    }

    if (this.mouseDown) {
      this.mouseDown = false

      const { onClick } = this.props
      if (onClick && this.isClicked(event) && this.mouseRootXY) {
        // clicked
        onClick(event, this.mouseRootXY)
      }
    }
  }

  private handleTouchStart = (event: TouchEvent): void => {
    const { isMoveDisabled } = this.props
    if (isMoveDisabled) {
      return
    }

    if (event.touches.length === 1) {
      const { rootCoordRef } = this.props

      if (isInsideSVG(event, rootCoordRef)) {
        event.preventDefault()

        this.updateTouchCoords(event)
        if (this.lastTap && window.performance.now() - this.lastTap < DOUBLE_CLICK_DELAY) {
          // double tap
          this.handleMapStateChange(initialMapState)
        } else {
          this.lastTap = window.performance.now()
        }
      }
    } else if (event.touches.length === 2 && this.prevTouchRootXYs) {
      // added second finger and first one was in the area
      event.preventDefault()

      this.updateTouchCoords(event)
    }
  }

  private handleTouchEnd = (event: TouchEvent): void => {
    const { isMoveDisabled } = this.props
    if (isMoveDisabled) {
      return
    }

    if (this.prevTouchRootXYs) {
      event.preventDefault()

      if (event.touches.length === 0) {
        this.prevTouchRootXYs = null
      } else if (event.touches.length === 1) {
        this.updateTouchCoords(event)
      }
    }
  }

  private handleWheel = (event: WheelEvent): boolean => {
    const { rootCoordRef } = this.props
    this.mouseRootXY = this.getRootXY(event)
    this.mouseCurrentXY = this.getCurrentXY(event)

    if (isInsideSVG(event, rootCoordRef)) {
      event.preventDefault()
      this.wheelDeltaYCummulated += event.deltaY
      this.handleWheelInner()
      return false // ページをスクロールさせない
    }
    return true
  }

  /**
   * drag なのか click なのかを判定する
   */
  private isClicked(event: MouseEvent): boolean {
    return (
      !this.prevDragScreenXY ||
      Math.abs(this.prevDragScreenXY.x - event.clientX) +
        Math.abs(this.prevDragScreenXY.y - event.clientY) <=
        CLICK_TOLERANCE
    )
  }

  private updateDragCoods(event: MouseEvent): void {
    this.prevDragRootXY = this.mouseRootXY
    this.prevDragScreenXY = { x: event.clientX, y: event.clientY }
  }

  private updateTouchCoords(event: TouchEvent): void {
    if (event.touches.length === 1) {
      const touch = event.touches[0]
      this.prevTouchRootXYs = [this.getRootXY(touch)]
    } else if (event.touches.length === 2) {
      // ピンチ中の場合
      const t1 = event.touches[0]
      const t2 = event.touches[1]
      const t1rootXY = this.getRootXY(t1)
      const t2rootXY = this.getRootXY(t2)

      this.prevTouchRootXYs = [t1rootXY, t2rootXY]
      this.prevTouchMidRootXY = {
        x: (t1rootXY.x + t2rootXY.x) / 2,
        y: (t1rootXY.y + t2rootXY.y) / 2,
      }
      this.prevTouchScreenDistance = Math.sqrt(
        (t1.clientX - t2.clientX) ** 2 + (t1.clientY - t2.clientY) ** 2,
      )
    }
  }

  /**
   * マウス（もしくはタッチ）位置を中心にズームする
   * @param currentXY ズームの中心の座標
   * @param zoom の変化量
   */
  private zoomAroundMouse(currentXY: XYPointObject, zoomDiff: number): void {
    const { mapState, innerScale } = this.props
    const nextMapState = calcZoomAround(currentXY, zoomDiff, mapState, innerScale)
    if (nextMapState) {
      this.handleMapStateChange(nextMapState)
    }
  }

  /**
   * 上位 component に mapState の変更を伝える
   */
  private handleMapStateChange(mapState: MapState): void {
    const { onMapStateChange } = this.props

    if (onMapStateChange) {
      onMapStateChange({ mapState })
    }
  }

  public render(): React.ReactElement {
    const { children } = this.props
    return (
      <g className='svg-map' ref={this.mapRef}>
        {children}
      </g>
    )
  }
}

export default SVGMap
