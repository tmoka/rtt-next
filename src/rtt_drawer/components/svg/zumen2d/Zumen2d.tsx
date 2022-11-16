import React from 'react'
import { Matrix } from 'transformation-matrix'
import {
  TorishinListType,
  SetsuListType,
  Zumen2dType,
  GenbaKeyType,
  TwoHeimensType,
} from '../../../../common/types'
import SVGMap from '../SVGMap'
import RTTShapeEditor from '../editor/RTTShapeEditor'
import SVGLayer from '../common/SVGLayer'
import BenchGrid from '../common/BenchGrid'
import SetsuLines from '../common/SetsuLines'
import SetsuOrToriLabels from '../common/SetsuOrToriLabels'
import ToriLines from '../common/ToriLines'
import Zumen2dColumnsAllStages from './Zumen2dColumnsAllStages'
import Zumen2dLinksAllStages from './Zumen2dLinksAllStages'
import { replaceEditorShapes, updateMapState } from '../../../actions'
import {
  ZUMEN_WIDTH,
  ZUMEN_HEIGHT,
  ZUMEN,
  ZUMEN_TYPE_TO_AS_XYZ,
  MapState,
  MenuConfigType,
  XOrY,
  DEFAULT_STROKE_WIDTH,
} from '../../../constants'
import {
  syncWithMapTrans,
  syncWithMapXFixedTrans,
  syncWithMapYFixedTrans,
  extendClearTrans,
  calcScaleFromTrans,
  SyncConfigType,
} from '../../../utils'
import { EditorState } from '../../../reducers'

type Zumen2dProps = Readonly<{
  zumenType: ZUMEN.HEIMEN | ZUMEN.RITSUMEN1 | ZUMEN.RITSUMEN2 | ZUMEN.SETSU_COMPARISON
  genbaKey: GenbaKeyType
  mapRef: React.RefObject<SVGMap> | null
  rootCoordRef: React.RefObject<SVGGElement> | null
  zumen2d: Zumen2dType
  torishinList: TorishinListType
  setsuList: SetsuListType
  mapState: MapState
  syncConfig: SyncConfigType
  editor: EditorState
  menuConfig: MenuConfigType
  axisWidth: number
  axisHeight: number
  clearTrans: Matrix
  twoHeimens?: TwoHeimensType
  getRootCTM: () => Matrix | null
  onEditorShapesReplace: typeof replaceEditorShapes
  onMapStateChange: typeof updateMapState
}>

const Zumen2d: React.FC<Zumen2dProps> = ({
  zumenType,
  genbaKey,
  mapRef,
  rootCoordRef,
  zumen2d,
  torishinList,
  setsuList,
  mapState,
  syncConfig,
  editor,
  menuConfig,
  axisWidth,
  axisHeight,
  clearTrans,
  twoHeimens,
  getRootCTM,
  onEditorShapesReplace,
  onMapStateChange,
}) => {
  const { torishinSize, isInfinityLink, isShowSetsuZValues } = menuConfig

  const zumen2dBodyTrans = syncWithMapTrans(mapState, syncConfig)
  const zumen2dBodyClearTrans = extendClearTrans(
    `${genbaKey}_${zumenType}_zumen2dBodyTrans`,
    mapState.zoom,
    zumen2dBodyTrans,
    clearTrans,
  )
  const zumen2dYAxisTrans = syncWithMapXFixedTrans(mapState, syncConfig)
  const zumen2dYAxisClearTrans = extendClearTrans(
    `${genbaKey}_${zumenType}_zumen2dYAxisTrans`,
    mapState.zoom,
    zumen2dYAxisTrans,
    clearTrans,
  )
  const zumen2dXAxisTrans = syncWithMapYFixedTrans(mapState, syncConfig)
  const zumen2dXAxisClearTrans = extendClearTrans(
    `${genbaKey}_${zumenType}_zumen2dXAxisTrans`,
    mapState.zoom,
    zumen2dXAxisTrans,
    clearTrans,
  )

  const strokeWidth = Math.round(DEFAULT_STROKE_WIDTH / calcScaleFromTrans(zumen2dBodyTrans))

  const { asX, asY } = ZUMEN_TYPE_TO_AS_XYZ[zumenType]
  const zumenHeimenOrSetsuComparison =
    zumenType === ZUMEN.HEIMEN || zumenType === ZUMEN.SETSU_COMPARISON

  return (
    <g className='svg-zumen2d'>
      <SVGLayer
        id='svg-zumen2d-body'
        x={axisWidth}
        y={axisHeight}
        width={ZUMEN_WIDTH - axisWidth}
        height={ZUMEN_HEIGHT - axisHeight}
        transformMat={zumen2dBodyTrans}
      >
        <RTTShapeEditor
          genbaKey={genbaKey}
          zumenType={zumenType}
          editor={editor}
          clearTrans={zumen2dBodyClearTrans}
          onEditorShapesReplace={onEditorShapesReplace}
        >
          <SVGMap
            ref={mapRef}
            rootCoordRef={rootCoordRef}
            mapState={mapState}
            innerScale={syncConfig.innerScale}
            getRootCTM={getRootCTM}
            isMoveDisabled={!!editor.tool}
            onMapStateChange={onMapStateChange}
          >
            <BenchGrid
              width={(ZUMEN_WIDTH - axisWidth) * 120}
              height={(ZUMEN_HEIGHT - axisHeight) * 120}
              intervalX={1000}
              intervalY={1000}
              numIntervalX={10000}
              numIntervalY={10000}
              strokeWidth={strokeWidth}
              clearTrans={zumen2dBodyClearTrans}
            />
            <ToriLines
              zumenType={zumenType}
              torishinList={torishinList}
              isInfinityLink={isInfinityLink}
              strokeWidth={strokeWidth}
            />
            {!zumenHeimenOrSetsuComparison ? (
              <SetsuLines
                key='z'
                setsuList={setsuList}
                strokeWidth={strokeWidth}
                dashScale={strokeWidth}
                isInfinityLine
              />
            ) : null}
            {zumenType === ZUMEN.SETSU_COMPARISON && twoHeimens ? (
              <>
                {twoHeimens.heimenSrc ? (
                  <>
                    <Zumen2dLinksAllStages
                      menuConfig={menuConfig}
                      zumen2d={twoHeimens.heimenSrc}
                      strokeWidth={strokeWidth}
                      zumenType={zumenType}
                      isSetsuComparisonSrc
                    />
                    <Zumen2dColumnsAllStages
                      menuConfig={menuConfig}
                      zumen2d={twoHeimens.heimenSrc}
                      clearTrans={zumen2dBodyClearTrans}
                      zumenType={zumenType}
                      twoHeimens={twoHeimens}
                      isSetsuComparisonSrc
                    />
                  </>
                ) : null}
                <Zumen2dLinksAllStages
                  menuConfig={menuConfig}
                  zumen2d={twoHeimens?.heimenDst}
                  strokeWidth={strokeWidth}
                  zumenType={zumenType}
                  isSetsuComparisonSrc={false}
                />
                <Zumen2dColumnsAllStages
                  menuConfig={menuConfig}
                  zumen2d={twoHeimens?.heimenDst}
                  clearTrans={zumen2dBodyClearTrans}
                  zumenType={zumenType}
                  twoHeimens={twoHeimens}
                  isSetsuComparisonSrc={false}
                />
              </>
            ) : (
              <>
                <Zumen2dLinksAllStages
                  menuConfig={menuConfig}
                  zumen2d={zumen2d}
                  strokeWidth={strokeWidth}
                  zumenType={zumenType}
                  isSetsuComparisonSrc={false}
                />
                <Zumen2dColumnsAllStages
                  menuConfig={menuConfig}
                  zumen2d={zumen2d}
                  clearTrans={zumen2dBodyClearTrans}
                  zumenType={zumenType}
                  isSetsuComparisonSrc={false}
                />
              </>
            )}
          </SVGMap>
        </RTTShapeEditor>
      </SVGLayer>
      <SVGLayer
        id='svg-zumen2d-y-axis'
        x={0}
        y={axisHeight}
        width={axisWidth}
        height={ZUMEN_HEIGHT - axisHeight}
        transformMat={zumen2dYAxisTrans}
      >
        <BenchGrid
          width={axisWidth * 120}
          height={(ZUMEN_HEIGHT - axisHeight) * 120}
          intervalX={10000}
          intervalY={10000}
          clearTrans={zumen2dYAxisClearTrans}
        />
        <SetsuOrToriLabels
          zumenType={zumenType}
          xy={XOrY.Y}
          asXY={asY}
          torishinList={torishinList}
          torishinSize={torishinSize}
          bodyTrans={zumen2dBodyTrans}
          setsuList={setsuList}
          zAxisWidth={axisWidth}
          isShowSetsuZValues={isShowSetsuZValues}
          clearTrans={zumen2dYAxisClearTrans}
        />
      </SVGLayer>
      <SVGLayer
        id='svg-zumen2d-x-axis'
        x={axisWidth}
        y={0}
        width={ZUMEN_WIDTH - axisWidth}
        height={axisHeight}
        transformMat={zumen2dXAxisTrans}
      >
        <BenchGrid
          width={(ZUMEN_WIDTH - axisWidth) * 120}
          height={axisHeight * 120}
          intervalX={10000}
          intervalY={10000}
          clearTrans={zumen2dXAxisClearTrans}
        />
        <SetsuOrToriLabels
          zumenType={zumenType}
          xy={XOrY.X}
          asXY={asX}
          torishinList={torishinList}
          torishinSize={torishinSize}
          bodyTrans={zumen2dBodyTrans}
          setsuList={setsuList}
          zAxisWidth={axisWidth}
          isShowSetsuZValues={isShowSetsuZValues}
          clearTrans={zumen2dXAxisClearTrans}
        />
      </SVGLayer>
    </g>
  )
}

export default Zumen2d
