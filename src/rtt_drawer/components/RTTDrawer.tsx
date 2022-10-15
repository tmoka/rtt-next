import React, { useCallback, useEffect, useRef } from 'react'
import { Badge, Nav } from 'react-bootstrap'
import {
  changeZumenType,
  DownloadPDFAACType,
  resetMapState,
  updateMapState,
  setEditorTool,
  replaceEditorShapes,
} from '../actions'
import {
  defaultRTTWebGenba,
  GenbaDataType,
  GenbaKeyType,
  GenbaFormat,
  RTTWebGenbaType,
} from '../../common/types'
import {
  MapState,
  MenuConfigType,
  ZUMEN,
  ZUMEN_TO_JA,
  HeaderInfoType,
  EVENT_CATEGORY,
} from '../constants'
import { AsyncStatusState, EditorSetState } from '../reducers'
import { getMenuConfigFormName, PDFError, isZumen, tracker } from '../utils'
import ErrorBoundary from './common/ErrorBoundary'
import RTTDrawerMenu from './RTTDrawerMenu'
import RTTSVG from './svg/RTTSVG'
import RTTSVGViewer from './svg/RTTSVGViewer'

const SVG_WIDTH = 640
const SVG_HEIGHT = 480

const NavItems: React.FC = () => {
  const items = Object.keys(ZUMEN).map((zumen) => (
    <Nav.Item key={zumen}>
      <Nav.Link eventKey={zumen}>{ZUMEN_TO_JA[zumen as ZUMEN]}</Nav.Link>
    </Nav.Item>
  ))
  return <>{items}</>
}

type GenbaFormatBadgeProps = Readonly<{
  format: GenbaFormat
}>

/**
 * GenbaData を読み込んだときのファイルの形式を表示するコンポーネント
 */
const GenbaFormatBadge: React.FC<GenbaFormatBadgeProps> = ({ format }) => {
  switch (format) {
    case GenbaFormat.OLD_GENBA:
      return <Badge variant='secondary'>従来版データ</Badge>
    case GenbaFormat.CSV:
      return <Badge variant='primary'>csvデータ</Badge>
    default:
      return null
  }
}

type RTTDrawerProps = Readonly<{
  genbaKey: GenbaKeyType
  rttwebGenba: RTTWebGenbaType
  genbaData: GenbaDataType | null
  asyncStatus: AsyncStatusState
  mapState: MapState
  editorSet: EditorSetState
  menuConfig: MenuConfigType
  headerInfo: HeaderInfoType
  zumenType: ZUMEN
  onEditorToolSet: typeof setEditorTool
  onEditorShapesReplace: typeof replaceEditorShapes
  onPDFDownload: DownloadPDFAACType
  onMapStateChange: typeof updateMapState
  onMapStateReset: typeof resetMapState
  onZumenTypeChange: typeof changeZumenType
}>

/**
 * rtt_drawer の本体となるコンポーネント
 */
const RTTDrawer: React.FC<RTTDrawerProps> = ({
  genbaKey,
  rttwebGenba = defaultRTTWebGenba,
  genbaData = null,
  asyncStatus,
  mapState,
  editorSet,
  menuConfig,
  headerInfo,
  zumenType,
  onEditorToolSet,
  onEditorShapesReplace,
  onPDFDownload,
  onMapStateChange,
  onMapStateReset,
  onZumenTypeChange,
}) => {
  useEffect(() => {
    // 初期描画もしくは図面切替時の処理
    tracker.event(EVENT_CATEGORY.ZUMEN_TYPE, zumenType)
  }, [zumenType])
  useEffect(() => {
    // genbaData 読み込み時の処理
    if (genbaData) {
      tracker.event(EVENT_CATEGORY.GENBA_DATA_FORMAT, genbaData.format)
    }
  }, [genbaData])

  const mapRef = useRef(null)

  const handleZumenTypeChange = useCallback(
    (nextZumenType: string | null): void => {
      if (!nextZumenType || !isZumen(nextZumenType)) {
        return
      }
      onZumenTypeChange({ genbaKey, zumenType: nextZumenType })
    },
    [genbaKey, onZumenTypeChange],
  )

  const handlePDFDownload = useCallback(() => {
    const download = async (): Promise<void> => {
      if (!genbaData) {
        throw new PDFError('描画画像を準備できませんでした。')
      }

      const svgNodeForPDF = (
        <RTTSVG
          genbaKey={genbaKey}
          mapRef={null}
          rootCoordRef={null}
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          genbaData={genbaData}
          mapState={mapState}
          zumenType={zumenType}
          editorSet={editorSet}
          menuConfig={menuConfig}
          headerInfo={headerInfo}
          onEditorShapesReplace={onEditorShapesReplace}
          onMapStateChange={onMapStateChange}
        />
      )
      const genbaName = headerInfo.genbaName || rttwebGenba.name

      try {
        // eslint-disable-next-line @typescript-eslint/await-thenable
        await onPDFDownload(svgNodeForPDF, genbaData, zumenType, menuConfig, genbaName)
      } catch (err) {
        console.error(err) // eslint-disable-line no-console
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    download()
  }, [
    editorSet,
    genbaData,
    genbaKey,
    headerInfo,
    mapState,
    menuConfig,
    onEditorShapesReplace,
    onMapStateChange,
    onPDFDownload,
    rttwebGenba.name,
    zumenType,
  ])

  const { statusDownloadPDF } = asyncStatus
  const menuConfigFormName = getMenuConfigFormName(genbaKey)

  /**
   * ErrorBoundary の key に渡す値。
   * MenuConfigのハッシュ値をkeyに使うことで、メニューを操作したときにErrorBoundaryがリセットされて再びsvgが描画されるようになる。
   */
  const svgErrorBoundaryKey = `${zumenType}_${menuConfig.hash}`

  return (
    <div className='rtt-drawer row'>
      <div className='col-12'>
        <Nav
          className='mb-3'
          variant='tabs'
          activeKey={zumenType}
          onSelect={handleZumenTypeChange}
          data-tid='zumen-tabs'
        >
          <NavItems />
          {genbaData ? (
            <div className='ml-auto d-flex align-items-center'>
              <GenbaFormatBadge format={genbaData.format} />
            </div>
          ) : null}
        </Nav>
      </div>
      <div className='col-sm-3'>
        <ErrorBoundary key={zumenType}>
          <RTTDrawerMenu
            zumenType={zumenType}
            menuConfig={menuConfig}
            genbaData={genbaData}
            statusDownloadPDF={statusDownloadPDF}
            form={menuConfigFormName}
            key={menuConfigFormName}
            onMapStateReset={onMapStateReset}
            onPDFDownload={handlePDFDownload}
          />
        </ErrorBoundary>
      </div>
      <div className='col-sm-9'>
        <div className='mb-3'>
          <ErrorBoundary key={svgErrorBoundaryKey}>
            <div style={{ width: 640 }}>
              <RTTSVGViewer
                genbaKey={genbaKey}
                mapRef={mapRef}
                width={SVG_WIDTH}
                height={SVG_HEIGHT}
                rttwebGenba={rttwebGenba}
                genbaData={genbaData}
                mapState={mapState}
                zumenType={zumenType}
                editorSet={editorSet}
                menuConfig={menuConfig}
                headerInfo={headerInfo}
                onEditorToolSet={onEditorToolSet}
                onEditorShapesReplace={onEditorShapesReplace}
                onMapStateChange={onMapStateChange}
              />
            </div>
          </ErrorBoundary>
        </div>

        {process.env.NODE_ENV === 'production' ? null : (
          <div>
            <pre style={{ maxHeight: '200px' }}>{JSON.stringify(mapState, null, 2)}</pre>
            <pre style={{ maxHeight: '200px' }}>{JSON.stringify(genbaData, null, 2)}</pre>
            <ErrorBoundary key={svgErrorBoundaryKey}>
              <RTTSVGViewer
                genbaKey={genbaKey}
                mapRef={null}
                width={480}
                height={360}
                rttwebGenba={rttwebGenba}
                genbaData={genbaData}
                mapState={mapState}
                zumenType={zumenType}
                editorSet={editorSet}
                menuConfig={menuConfig}
                headerInfo={headerInfo}
                onEditorToolSet={onEditorToolSet}
                onEditorShapesReplace={onEditorShapesReplace}
                onMapStateChange={onMapStateChange}
              />
            </ErrorBoundary>
          </div>
        )}
      </div>
    </div>
  )
}

export default RTTDrawer
