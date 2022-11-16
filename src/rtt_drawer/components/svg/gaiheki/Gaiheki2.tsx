import React from 'react'
import {
  fromObject,
  shear,
  translate,
  transform,
  toSVG,
  rotate,
  scale,
  identity,
  Matrix,
} from 'transformation-matrix'
import {
  GaihekiKey,
  GenbaKeyType,
  SetsuListType,
  TorishinListType,
  GaihekiType,
  AXIS,
} from '../../../../common/types'
import {
  ZUMEN_WIDTH,
  ZUMEN_HEIGHT,
  ZUMEN,
  MapState,
  MenuConfigType,
  XOrY,
  DEFAULT_STROKE_WIDTH,
} from '../../../constants'
import {
  syncWithMapTrans,
  syncWithMapXFixedTrans,
  syncWithMapYFixedTrans,
  matFromArray,
  extendClearTrans,
  zoom2scale,
  calcScaleFromTrans,
  selectGosaStageDst,
  SyncConfigType,
} from '../../../utils'
import { replaceEditorShapes, updateMapState } from '../../../actions'
import { EditorState } from '../../../reducers'
import SVGMap from '../SVGMap'
import RTTShapeEditor from '../editor/RTTShapeEditor'
import SVGLayer from '../common/SVGLayer'
import BenchGrid from '../common/BenchGrid'
import SetsuLabels from '../common/SetsuLabels'
import SetsuLines from '../common/SetsuLines'
import GaihekiColumns from './GaihekiColumns'
import GaihekiLinks from './GaihekiLinks'
import ToriLines from '../common/ToriLines'
import SetsuOrToriLabels from '../common/SetsuOrToriLabels'

type Gaiheki2Props = Readonly<{
  genbaKey: GenbaKeyType
  mapRef: React.RefObject<SVGMap> | null
  rootCoordRef: React.RefObject<SVGGElement> | null
  mapState: MapState
  syncConfig: SyncConfigType
  editor: EditorState
  menuConfig: MenuConfigType
  axisWidth: number
  axisHeight: number
  shearHeight: number
  shearDegree: number
  clearTrans: Matrix
  getRootCTM: () => Matrix | null
  onEditorShapesReplace: typeof replaceEditorShapes
  onMapStateChange: typeof updateMapState
  setsuList: SetsuListType
  torishinList: TorishinListType
  gaihekiData: GaihekiType
}>

const Gaiheki2: React.FC<Gaiheki2Props> = ({
  genbaKey,
  mapRef,
  rootCoordRef,
  setsuList,
  torishinList,
  mapState,
  syncConfig,
  editor,
  menuConfig,
  axisWidth,
  axisHeight,
  shearHeight,
  shearDegree,
  clearTrans,
  getRootCTM,
  onEditorShapesReplace,
  onMapStateChange,
  gaihekiData,
}) => {
  const {
    stagesDst,
    gosaScale,
    gosaValueFontSize,
    torishinSize,
    columnSize,
    decimalDigits,
    isShowSetsuZValues,
    isShowGosaValues,
    isShowLinks,
    gaiheki2YKey,
  } = menuConfig

  const { points, links } = gaihekiData

  const shearWidth = shearHeight / Math.tan((shearDegree * Math.PI) / 180)

  const shearTrans = transform(
    translate(ZUMEN_WIDTH - shearWidth, axisHeight),
    shear(0, Math.tan((shearDegree * Math.PI) / 180)),
  )
  const ceilTrans = transform(
    translate(axisWidth, ZUMEN_HEIGHT - shearHeight),
    fromObject(
      matFromArray([
        [1, 1, 0],
        [0, Math.tan((shearDegree * Math.PI) / 180), 0],
      ]),
    ),
  )

  const gaiheki2SideTrans = syncWithMapXFixedTrans(mapState, syncConfig)
  const gaiheki2SideClearTrans = extendClearTrans(
    `${genbaKey}_gaiheki2SideTrans`,
    mapState.zoom,
    transform(shearTrans, gaiheki2SideTrans),
    clearTrans,
  )
  const gaiheki2CeilTrans = syncWithMapYFixedTrans(mapState, syncConfig)
  const gaiheki2CeilClearTrans = extendClearTrans(
    `${genbaKey}_gaiheki2CeilTrans`,
    mapState.zoom,
    transform(ceilTrans, gaiheki2CeilTrans),
    clearTrans,
  )
  const gaiheki2YAxisTrans = syncWithMapXFixedTrans(mapState, syncConfig)
  const gaiheki2YAxisClearTrans = extendClearTrans(
    `${genbaKey}_gaiheki2YAxisTrans`,
    mapState.zoom,
    gaiheki2YAxisTrans,
    clearTrans,
  )
  const gaiheki2XAxisTrans = syncWithMapYFixedTrans(mapState, syncConfig)
  const gaiheki2XAxisClearTrans = extendClearTrans(
    `${genbaKey}_gaiheki2XAxisTrans`,
    mapState.zoom,
    gaiheki2XAxisTrans,
    clearTrans,
  )
  const gaiheki2BodyTrans = syncWithMapTrans(mapState, syncConfig)
  const gaiheki2BodyClearTrans = extendClearTrans(
    `${genbaKey}_gaiheki2BodyTrans`,
    mapState.zoom,
    gaiheki2BodyTrans,
    clearTrans,
  )

  const scaleValue = zoom2scale(mapState.zoom) * syncConfig.innerScale
  const gaiheki2Trans = transform(
    rotate((-shearDegree * Math.PI) / 180),
    scale(scaleValue, scaleValue),
  )
  const gaiheki2ClearTrans = extendClearTrans(
    `${genbaKey}_gaiheki2Trans`,
    mapState.zoom,
    gaiheki2Trans,
    identity(),
  )

  const strokeWidth = Math.round(DEFAULT_STROKE_WIDTH / calcScaleFromTrans(gaiheki2BodyTrans))

  const gaiheki2IsPlus = gaiheki2YKey === GaihekiKey.Y_P
  const gosaStageDst = selectGosaStageDst(menuConfig)

  const pointsElems = stagesDst.map((stage) => (
    <GaihekiColumns
      key={stage}
      points={points}
      stage={stage}
      gosaScale={gosaScale}
      zumenType={ZUMEN.GAIHEKI2}
      columnSize={columnSize}
      fontSize={gosaValueFontSize}
      strokeWidth={strokeWidth}
      gaihekiTrans={gaiheki2Trans}
      gaihekiClearTrans={gaiheki2ClearTrans}
      clearTrans={gaiheki2BodyClearTrans}
      decimalDigits={decimalDigits}
      isPlus={gaiheki2IsPlus}
      gosaStageDst={gosaStageDst}
      isShowGosaValues={isShowGosaValues}
    />
  ))

  const linksElems = isShowLinks
    ? stagesDst.map((stage) => (
        <GaihekiLinks
          key={stage}
          points={points}
          links={links}
          stage={stage}
          gosaScale={gosaScale}
          zumenType={ZUMEN.GAIHEKI2}
          gaihekiTrans={gaiheki2Trans}
          clearTrans={gaiheki2BodyClearTrans}
          strokeWidth={DEFAULT_STROKE_WIDTH}
          isPlus={gaiheki2IsPlus}
        />
      ))
    : null

  return (
    <g className='svg-gaiheki2'>
      <g transform={toSVG(shearTrans)}>
        <SVGLayer
          id='svg-gaiheki2-side'
          x={0}
          y={0}
          width={ZUMEN_WIDTH}
          height={ZUMEN_HEIGHT - shearHeight - axisHeight}
          transformMat={gaiheki2SideTrans}
        >
          <BenchGrid clearTrans={gaiheki2SideClearTrans} />
          <SetsuLines
            setsuList={setsuList}
            strokeWidth={strokeWidth}
            dashScale={1}
            isInfinityLine={false}
          />
        </SVGLayer>
      </g>
      <g transform={toSVG(ceilTrans)}>
        <SVGLayer
          id='svg-gaiheki2-ceil'
          x={0}
          y={0}
          width={ZUMEN_WIDTH}
          height={ZUMEN_HEIGHT}
          transformMat={gaiheki2CeilTrans}
        >
          <BenchGrid clearTrans={gaiheki2CeilClearTrans} />
          <ToriLines
            zumenType={ZUMEN.GAIHEKI2}
            torishinList={torishinList}
            strokeWidth={strokeWidth}
            dashScale={1}
            isInfinityLink={false}
          />
        </SVGLayer>
      </g>
      <SVGLayer
        id='svg-gaiheki2-y-axis'
        x={0}
        y={axisHeight}
        width={axisWidth}
        height={ZUMEN_HEIGHT - shearHeight - axisHeight}
        transformMat={gaiheki2YAxisTrans}
      >
        <BenchGrid clearTrans={gaiheki2YAxisClearTrans} />
        <SetsuLabels
          setsuList={setsuList}
          zAxisWidth={axisWidth}
          isShowSetsuZValues={isShowSetsuZValues}
          clearTrans={gaiheki2YAxisClearTrans}
        />
      </SVGLayer>
      <SVGLayer
        id='svg-gaiheki2-x-axis'
        x={axisWidth}
        y={0}
        width={ZUMEN_WIDTH - shearWidth - axisWidth}
        height={axisHeight}
        transformMat={gaiheki2XAxisTrans}
      >
        <BenchGrid clearTrans={gaiheki2XAxisClearTrans} />
        <SetsuOrToriLabels
          zumenType={ZUMEN.GAIHEKI2}
          xy={XOrY.X}
          asXY={AXIS.X}
          torishinList={torishinList}
          torishinSize={torishinSize}
          bodyTrans={gaiheki2BodyTrans}
          setsuList={setsuList}
          zAxisWidth={axisWidth}
          isShowSetsuZValues
          clearTrans={gaiheki2XAxisClearTrans}
        />
      </SVGLayer>
      <SVGLayer
        id='svg-gaiheki2-body'
        x={axisWidth}
        y={axisHeight}
        width={ZUMEN_WIDTH - shearWidth - axisWidth}
        height={ZUMEN_HEIGHT - shearHeight - axisHeight}
        transformMat={gaiheki2BodyTrans}
      >
        <RTTShapeEditor
          genbaKey={genbaKey}
          zumenType={ZUMEN.GAIHEKI2}
          editor={editor}
          clearTrans={gaiheki2BodyClearTrans}
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
            <BenchGrid clearTrans={gaiheki2BodyClearTrans} />
            <SetsuLines setsuList={setsuList} strokeWidth={strokeWidth} dashScale={strokeWidth} />
            <ToriLines
              zumenType={ZUMEN.GAIHEKI2}
              torishinList={torishinList}
              strokeWidth={strokeWidth}
              isInfinityLink
            />
            {pointsElems}
            {linksElems}
          </SVGMap>
        </RTTShapeEditor>
      </SVGLayer>
    </g>
  )
}

export default React.memo(Gaiheki2)
