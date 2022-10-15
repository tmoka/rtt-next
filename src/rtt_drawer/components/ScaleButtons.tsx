import React, { useCallback } from 'react'
import { inverse, transform, applyToPoint, Matrix } from 'transformation-matrix'
import { ButtonGroup, Button } from 'react-bootstrap'
import { ZUMEN_WIDTH, ZUMEN_HEIGHT, initialMapState, MapState } from '../constants'
import { calcZoomAround } from '../utils'
import { updateMapState } from '../actions'

/**
 * 拡大/縮小ボタンを操作したときに変化させるzoomの量
 */
const ZOOM_STEP = 0.25

type ScaleButtonsProps = Readonly<{
  mapState?: MapState
  innerScale?: number
  className?: string
  /** screen -> root への座標変換行列を取得する関数 */
  getRootCTM?: (() => Matrix | null) | null
  /** screen -> SVGMap への座標変換行列を取得する関数 */
  getMapCTM?: (() => Matrix | null) | null
  onMapStateChange?: typeof updateMapState | null
}>

const ScaleButtons: React.FC<ScaleButtonsProps> = ({
  mapState = initialMapState,
  innerScale = undefined,
  className = '',
  getRootCTM = null,
  getMapCTM = null,
  onMapStateChange = null,
}) => {
  /**
   * 縮小ボタン or 拡大ボタンをクリックされたとき
   */
  const handleZoomChange = useCallback(
    (zoomDiff: number): void => {
      if (!innerScale || !getMapCTM || !getRootCTM || !onMapStateChange) {
        return
      }
      const mapCTM = getMapCTM()
      const rootCTM = getRootCTM()
      if (!mapCTM || !rootCTM) {
        return
      }

      // 拡大/縮小する中心点の座標を求める
      const rootToCurrentMat = transform(inverse(mapCTM), rootCTM)
      const innerCenterPoint = { x: ZUMEN_WIDTH / 2, y: ZUMEN_HEIGHT / 2 }
      const currentXY = applyToPoint(rootToCurrentMat, innerCenterPoint)

      const nextMapState = calcZoomAround(currentXY, zoomDiff, mapState, innerScale)
      if (nextMapState) {
        onMapStateChange({ mapState: nextMapState })
      }
    },
    [getMapCTM, getRootCTM, innerScale, mapState, onMapStateChange],
  )

  /**
   * 縮小ボタンをクリックされたとき
   */
  const handleMinusClick = useCallback((): void => {
    if (!mapState) {
      return
    }
    const zoomDiff = Math.ceil((mapState.zoom - ZOOM_STEP) / ZOOM_STEP) * ZOOM_STEP - mapState.zoom
    handleZoomChange(zoomDiff)
  }, [handleZoomChange, mapState])

  /**
   * リセットボタンをクリックされたとき
   */
  const handleEqualClick = useCallback((): void => {
    if (!onMapStateChange) {
      return
    }
    onMapStateChange({ mapState: initialMapState }) // リセットする
  }, [onMapStateChange])

  /**
   * 拡大ボタンをクリックされたとき
   */
  const handlePlusClick = useCallback((): void => {
    if (!mapState) {
      return
    }
    const zoomDiff = Math.floor((mapState.zoom + ZOOM_STEP) / ZOOM_STEP) * ZOOM_STEP - mapState.zoom
    handleZoomChange(zoomDiff)
  }, [handleZoomChange, mapState])

  return (
    <ButtonGroup size='sm' className={className}>
      <Button variant='light' onClick={handleMinusClick}>
        <i className='fas fa-minus' />
      </Button>
      <Button variant='light' onClick={handleEqualClick}>
        <i className='fas fa-equals' />
      </Button>
      <Button variant='light' onClick={handlePlusClick}>
        <i className='fas fa-plus' />
      </Button>
    </ButtonGroup>
  )
}

export default ScaleButtons
