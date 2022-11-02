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
  GenbaKeyType,
  SetsuListType,
  TorishinListType,
  GaihekiType,
  AXIS,
  GaihekiKey,
} from '../../../../common/types'
import {
  MapState,
  MenuConfigType,
  XOrY,
  ZUMEN_WIDTH,
  ZUMEN_HEIGHT,
  ZUMEN,
  DEFAULT_STROKE_WIDTH,
} from '../../../constants'
import {
  syncWithMapTrans,
  syncWithMapXFixedTrans,
  syncWithMapYFixedTrans,
  matFromArray,
  extendClearTrans,
  calcScaleFromTrans,
  zoom2scale,
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

type Gaiheki1Props = Readonly<{
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

const Gaiheki1: React.FC<Gaiheki1Props> = ({
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
    gaiheki1XKey,
  } = menuConfig

  const { points, links } = gaihekiData

  const shearTrans = transform(
    translate(axisWidth, 0),
    shear(0, Math.tan((shearDegree * Math.PI) / 180)),
  )

  const ceilTrans = transform(
    translate(axisWidth, ZUMEN_HEIGHT - shearHeight + axisHeight),
    fromObject(
      matFromArray([
        [1, -1, 0],
        [Math.tan((shearDegree * Math.PI) / 180), Math.tan((shearDegree * Math.PI) / 180), 0],
      ]),
    ),
  )

  const gaiheki1CeilTrans = syncWithMapYFixedTrans(mapState, syncConfig)
  const gaiheki1CeilClearTrans = extendClearTrans(
    `${genbaKey}_gaiheki1CeilTrans`,
    mapState.zoom,
    transform(ceilTrans, gaiheki1CeilTrans),
    clearTrans,
  )

  const gaiheki1YAxisTrans = syncWithMapXFixedTrans(mapState, syncConfig)
  const gaiheki1YAxisClearTrans = extendClearTrans(
    `${genbaKey}_gaiheki1YAxisTrans`,
    mapState.zoom,
    gaiheki1YAxisTrans,
    clearTrans,
  )
  const gaiheki1XAxisTrans = syncWithMapYFixedTrans(mapState, syncConfig)
  const gaiheki1XAxisClearTrans = extendClearTrans(
    `${genbaKey}_gaiheki1XAxisTrans`,
    mapState.zoom,
    transform(shearTrans, gaiheki1XAxisTrans),
    clearTrans,
  )
  const gaiheki1BodyTrans = syncWithMapTrans(mapState, syncConfig)
  const gaiheki1BodyClearTrans = extendClearTrans(
    `${genbaKey}_gaiheki1BodyTrans`,
    mapState.zoom,
    transform(shearTrans, gaiheki1BodyTrans),
    clearTrans,
  )

  const scaleValue = zoom2scale(mapState.zoom) * syncConfig.innerScale
  const gaiheki1Trans = transform(
    rotate(((shearDegree + 180) * Math.PI) / 180),
    scale(scaleValue, scaleValue),
  )
  const gaiheki1ClearTrans = extendClearTrans(
    `${genbaKey}_gaiheki1Trans`,
    mapState.zoom,
    gaiheki1Trans,
    identity(),
  )

  const strokeWidth = Math.round(DEFAULT_STROKE_WIDTH / calcScaleFromTrans(gaiheki1BodyTrans))

  const gaiheki1IsPlus = gaiheki1XKey === GaihekiKey.X_P
  const gosaStageDst = selectGosaStageDst(menuConfig)

  const pointsElems = stagesDst.map((stage) => (
    <GaihekiColumns
      key={stage}
      points={points}
      stage={stage}
      gosaScale={gosaScale}
      zumenType={ZUMEN.GAIHEKI1}
      columnSize={columnSize}
      fontSize={gosaValueFontSize}
      strokeWidth={strokeWidth}
      gaihekiTrans={gaiheki1Trans}
      gaihekiClearTrans={gaiheki1ClearTrans}
      clearTrans={gaiheki1BodyClearTrans}
      decimalDigits={decimalDigits}
      isPlus={gaiheki1IsPlus}
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
          zumenType={ZUMEN.GAIHEKI1}
          gaihekiTrans={gaiheki1Trans}
          clearTrans={gaiheki1BodyClearTrans}
          strokeWidth={DEFAULT_STROKE_WIDTH}
          isPlus={gaiheki1IsPlus}
        />
      ))
    : null

  return (
    <g className='svg-gaiheki1'>
      <g transform={toSVG(ceilTrans)}>
        <SVGLayer
          id='svg-gaiheki1-ceil'
          x={0}
          y={0}
          width={ZUMEN_WIDTH}
          height={ZUMEN_HEIGHT}
          transformMat={gaiheki1CeilTrans}
        >
          <BenchGrid clearTrans={gaiheki1CeilClearTrans} />
          <ToriLines
            zumenType={ZUMEN.GAIHEKI1}
            torishinList={torishinList}
            strokeWidth={strokeWidth}
            dashScale={1}
            isInfinityLink={false}
          />
        </SVGLayer>
      </g>
      <SVGLayer
        id='svg-gaiheki1-y-axis'
        x={0}
        y={axisHeight}
        width={axisWidth}
        height={ZUMEN_HEIGHT - shearHeight}
        transformMat={gaiheki1YAxisTrans}
      >
        <BenchGrid clearTrans={gaiheki1YAxisClearTrans} />
        <SetsuLabels
          setsuList={setsuList}
          zAxisWidth={axisWidth}
          isShowSetsuZValues={isShowSetsuZValues}
          clearTrans={gaiheki1YAxisClearTrans}
        />
      </SVGLayer>
      <g transform={toSVG(shearTrans)}>
        <SVGLayer
          id='svg-gaiheki1-x-axis'
          x={0}
          y={0}
          width={ZUMEN_WIDTH}
          height={axisHeight}
          transformMat={gaiheki1XAxisTrans}
        >
          <BenchGrid clearTrans={gaiheki1XAxisClearTrans} />
          <SetsuOrToriLabels
            zumenType={ZUMEN.GAIHEKI1}
            xy={XOrY.X}
            asXY={AXIS.Y}
            torishinList={torishinList}
            torishinSize={torishinSize}
            bodyTrans={gaiheki1BodyTrans}
            setsuList={setsuList}
            zAxisWidth={axisWidth}
            isShowSetsuZValues
            clearTrans={gaiheki1XAxisClearTrans}
          />
        </SVGLayer>
        <SVGLayer
          id='svg-gaiheki1-body'
          x={0}
          y={axisHeight}
          width={ZUMEN_WIDTH}
          height={ZUMEN_HEIGHT - shearHeight}
          transformMat={gaiheki1BodyTrans}
        >
          <RTTShapeEditor
            genbaKey={genbaKey}
            zumenType={ZUMEN.GAIHEKI1}
            editor={editor}
            clearTrans={gaiheki1BodyClearTrans}
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
                width={ZUMEN_WIDTH}
                height={ZUMEN_HEIGHT - shearHeight}
                strokeWidth={strokeWidth}
                clearTrans={gaiheki1BodyClearTrans}
              />
              <SetsuLines setsuList={setsuList} strokeWidth={strokeWidth} dashScale={strokeWidth} />
              <ToriLines
                zumenType={ZUMEN.GAIHEKI1}
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
    </g>
  )
}

export default React.memo(Gaiheki1)
