import React, { useCallback, useRef } from 'react'
import { ButtonToolbar, ToggleButton, OverlayTrigger, Popover } from 'react-bootstrap'
import { Matrix } from 'transformation-matrix'
import { GenbaDataType, GenbaKeyType, RTTWebGenbaType } from '../../../common/types'
import { setEditorTool, replaceEditorShapes, updateMapState } from '../../actions'
import {
  MapState,
  MenuConfigType,
  ZUMEN,
  HeaderInfoType,
  EditorShapeKind,
  EVENT_CATEGORY,
  RTTWEB_HELP_SHAPES_URL,
} from '../../constants'
import { EditorSetState } from '../../reducers'
import {
  calcInnerTranslateAndScale,
  calcMapConfig,
  getHeaderInfoFormName,
  RTTDrawerError,
} from '../../utils'
import ScaleButtons from '../ScaleButtons'
import RTTSVG from './RTTSVG'
import SVGMap from './SVGMap'
import ButtonWithTracking from '../common/ButtonWithTracking'
import ToggleButtonGroupWithTracking from '../common/ToggleButtonGroupWithTracking'
import HeaderInfoForm from '../headerInfo/HeaderInfoForm'

const EditorToolPopover = (
  <Popover id='rect-button-popover' title='編集ツール'>
    <dl>
      <dt>
        <i className='mr-2 fas fa-vector-square' />
        長方形
      </dt>
      <dd>長方形を追加します。</dd>
      <dt>
        <i className='mr-2 fas fa-slash' />
        直線
      </dt>
      <dd>直線を追加します。</dd>
      <dt>
        <i className='mr-2 fas fa-trash-alt' />
        全削除
      </dt>
      <dd>図形をすべて削除します。</dd>
    </dl>
    <a href={RTTWEB_HELP_SHAPES_URL} target='_blank' rel='noopener noreferrer'>
      詳しい使い方
    </a>
  </Popover>
)

const overlayDelayConfig = { show: 1000, hide: 1000 }

type RTTSVGViewerProps = Readonly<{
  genbaKey: GenbaKeyType
  /** SVGMapを指すref */
  mapRef: React.RefObject<SVGMap> | null
  /** RTTSVGViewer を画面に表示するときの幅 */
  width: number
  /** RTTSVGViewer を画面に表示するときの高さ */
  height: number
  rttwebGenba: RTTWebGenbaType
  genbaData: GenbaDataType | null
  mapState: MapState
  zumenType: ZUMEN
  editorSet: EditorSetState
  menuConfig: MenuConfigType
  headerInfo: HeaderInfoType
  onEditorToolSet: typeof setEditorTool
  onEditorShapesReplace: typeof replaceEditorShapes
  onMapStateChange: typeof updateMapState
}>

/**
 * svgを描画するコンポーネント
 */
const RTTSVGViewer: React.FC<RTTSVGViewerProps> = ({
  genbaKey,
  mapRef = null,
  width,
  height,
  rttwebGenba,
  genbaData,
  mapState,
  zumenType,
  editorSet,
  menuConfig,
  headerInfo,
  onEditorToolSet,
  onEditorShapesReplace,
  onMapStateChange,
}) => {
  /**
   * root座標系のg要素を指すref
   */
  const rootCoordRef = useRef<SVGGElement>(null)

  /**
   * screen -> root の座標変換行列を返す
   * @returns
   */
  const getRootCTM = useCallback((): Matrix | null => {
    if (!rootCoordRef.current) {
      // 未だ初期化が終わっていない時
      return null
    }
    return rootCoordRef.current.getScreenCTM()
  }, [])

  /**
   * screen -> map の座標変換行列を返す
   * @returns
   */
  const getMapCTM = useCallback((): Matrix | null => {
    if (!mapRef || !mapRef.current) {
      // 未だ初期化が終わっていない時
      return null
    }
    return mapRef.current.getCurrentCTM()
  }, [mapRef])

  const editor = editorSet[zumenType]

  const handleEditorToolChange = useCallback(
    (value: string | string[]): void => {
      if (!Array.isArray(value)) {
        throw new RTTDrawerError('不明なエラーが発生しました')
      }
      const lastAddedTool = value[value.length - 1] as EditorShapeKind | undefined
      onEditorToolSet({ genbaKey, zumenType, tool: lastAddedTool })
    },
    [genbaKey, onEditorToolSet, zumenType],
  )

  const handleAllEditorShapesClear = useCallback((): void => {
    // eslint-disable-next-line no-alert
    const yes = window.confirm('図形をすべて削除しますか？')
    if (yes) {
      onEditorShapesReplace({ genbaKey, zumenType, shapes: [] })
    }
  }, [genbaKey, onEditorShapesReplace, zumenType])

  const headerInfoFormName = getHeaderInfoFormName(genbaKey)
  const mapConfig = calcMapConfig(genbaData, zumenType, menuConfig)
  const syncConfig = mapConfig ? calcInnerTranslateAndScale(mapConfig) : null

  return (
    <div className='rtt-svg-viewer'>
      <RTTSVG
        genbaKey={genbaKey}
        mapRef={mapRef}
        rootCoordRef={rootCoordRef}
        width={width}
        height={height}
        genbaData={genbaData}
        mapState={mapState}
        zumenType={zumenType}
        editorSet={editorSet}
        menuConfig={menuConfig}
        headerInfo={headerInfo}
        getRootCTM={getRootCTM}
        onEditorShapesReplace={onEditorShapesReplace}
        onMapStateChange={onMapStateChange}
      />
      <div className='my-1 d-flex'>
        {syncConfig ? (
          <ButtonToolbar>
            <ScaleButtons
              mapState={mapState}
              innerScale={syncConfig.innerScale}
              getRootCTM={getRootCTM}
              getMapCTM={getMapCTM}
              onMapStateChange={onMapStateChange}
            />
          </ButtonToolbar>
        ) : null}
        <div className='d-flex ml-auto'>
          <div className='mr-3 d-inline-block'>
            <HeaderInfoForm
              key={headerInfoFormName}
              form={headerInfoFormName}
              initialValues={{ genbaName: rttwebGenba.name }}
            />
          </div>
          <ButtonToolbar>
            <OverlayTrigger placement='top' delay={overlayDelayConfig} overlay={EditorToolPopover}>
              <div>
                <ToggleButtonGroupWithTracking
                  eventCategory={EVENT_CATEGORY.RTT_DRAWER_MENU}
                  size='sm'
                  name='editor-tool'
                  className='mr-1'
                  type='checkbox'
                  value={editor.tool ? [editor.tool] : undefined}
                >
                  <ToggleButton
                    variant={editor.tool === EditorShapeKind.RECT ? 'success' : 'light'}
                    type='checkbox'
                    value={EditorShapeKind.RECT}
                    data-tid='editor-tool-rect-button'
                  >
                    <i className='fas fa-vector-square' />
                  </ToggleButton>
                  <ToggleButton
                    variant={editor.tool === EditorShapeKind.LINE ? 'success' : 'light'}
                    type='checkbox'
                    value={EditorShapeKind.LINE}
                    data-tid='editor-tool-line-button'
                  >
                    <i className='fas fa-slash' />
                  </ToggleButton>
                </ToggleButtonGroupWithTracking>
                <ButtonWithTracking
                  eventCategory={EVENT_CATEGORY.RTT_DRAWER_MENU}
                  eventAction='CLEAR_ALL_EDITOR_SHAPES'
                  onClick={handleAllEditorShapesClear}
                  variant='light'
                  size='sm'
                  data-tid='clear-all-editor-shapes-button'
                >
                  <i className='fas fa-trash-alt' />
                </ButtonWithTracking>
              </div>
            </OverlayTrigger>
          </ButtonToolbar>
        </div>
      </div>
    </div>
  )
}

export default RTTSVGViewer
