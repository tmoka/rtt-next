import React from 'react'
import { Matrix, scale, toSVG, transform, translate, identity } from 'transformation-matrix'
import { GenbaDataType, GenbaKeyType } from '../../../common/types'
import { replaceEditorShapes, updateMapState } from '../../actions'
import {
  MapState,
  MenuConfigType,
  ROOT_HEIGHT,
  ROOT_WIDTH,
  ZUMEN,
  ZUMEN_HEIGHT,
  ZUMEN_WIDTH,
  HeaderInfoType,
  DEFAULT_STROKE_WIDTH,
} from '../../constants'
import { EditorSetState } from '../../reducers'
import ClipRect from './common/ClipRect'
import Defs from './Defs'
import Header from './Header'
import SVGMap from './SVGMap'
import ZumenBody from './ZumenBody'
import { extendClearTrans } from '../../utils'

/**
 * root座標系が左下原点になるようにするための座標変換
 */
const rootTrans = transform(translate(0, ROOT_HEIGHT), scale(1, -1))

type RTTSVGProps = Readonly<{
  genbaKey: GenbaKeyType
  /** SVGMapを指すref */
  mapRef: React.RefObject<SVGMap> | null
  rootCoordRef: React.RefObject<SVGGElement> | null
  /** RTTSVGViewer を画面に表示するときの幅 */
  width: number
  /** RTTSVGViewer を画面に表示するときの高さ */
  height: number
  genbaData: GenbaDataType | null
  mapState: MapState
  zumenType: ZUMEN
  editorSet: EditorSetState
  menuConfig: MenuConfigType
  headerInfo: HeaderInfoType
  getRootCTM?: () => Matrix | null
  onEditorShapesReplace: typeof replaceEditorShapes
  onMapStateChange: typeof updateMapState
}>

const RTTSVG: React.FC<RTTSVGProps> = ({
  genbaKey,
  mapRef,
  rootCoordRef,
  width,
  height,
  genbaData,
  mapState,
  zumenType,
  editorSet,
  menuConfig,
  headerInfo,
  getRootCTM = () => null,
  onEditorShapesReplace,
  onMapStateChange,
}) => {
  const rootClearTrans = extendClearTrans('rootTrans', mapState.zoom, rootTrans, identity())

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${ROOT_WIDTH} ${ROOT_HEIGHT}`}
      xmlns='http://www.w3.org/2000/svg'
      version='1.1'
    >
      <Defs menuConfig={menuConfig} />
      <g transform={toSVG(rootTrans)} ref={rootCoordRef}>
        {/* 一番後ろの背景に rect を置いておくことで、 click event をキャッチする  */}
        <rect x={0} y={0} width={ZUMEN_WIDTH} height={ZUMEN_HEIGHT} fill='white' fillOpacity={0} />
        <ClipRect id='svg-zumen-clip' x={0} y={0} width={ZUMEN_WIDTH} height={ZUMEN_HEIGHT}>
          <ZumenBody
            genbaKey={genbaKey}
            mapRef={mapRef}
            rootCoordRef={rootCoordRef}
            genbaData={genbaData}
            mapState={mapState}
            zumenType={zumenType}
            editorSet={editorSet}
            menuConfig={menuConfig}
            clearTrans={rootClearTrans}
            getRootCTM={getRootCTM}
            onEditorShapesReplace={onEditorShapesReplace}
            onMapStateChange={onMapStateChange}
          />
        </ClipRect>
      </g>
      <Header
        genbaData={genbaData}
        zumenType={zumenType}
        menuConfig={menuConfig}
        headerInfo={headerInfo}
      />
      <rect
        x='0'
        y='0'
        width={ROOT_WIDTH}
        height={ROOT_HEIGHT}
        stroke='black'
        strokeWidth={DEFAULT_STROKE_WIDTH}
        fill='none'
      />
    </svg>
  )
}

export default RTTSVG
