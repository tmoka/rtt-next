import React from 'react'
import { transform, translate, scale, Matrix } from 'transformation-matrix'
import {
  BasicStage,
  GenbaKeyType,
  PointsType,
  SetsuListType,
  TorishinType,
} from '../../../../common/types'
import {
  ZUMEN_WIDTH,
  ZUMEN_HEIGHT,
  INFINITY,
  getStageColor,
  MapState,
  MenuConfigType,
  XOrY,
  ZUMEN,
  DEFAULT_STROKE_WIDTH,
} from '../../../constants'
import {
  syncWithMapXFixedTrans,
  extendClearTrans,
  RTTDrawerError,
  selectGosaStageDst,
  SyncConfigType,
  toXYKey,
  mean,
} from '../../../utils'
import SVGMap from '../SVGMap'
import RTTShapeEditor from '../editor/RTTShapeEditor'
import SVGLayer from '../common/SVGLayer'
import BenchGrid from '../common/BenchGrid'
import ToriLabel from '../common/ToriLabel'
import DashLine from '../common/DashLine'
import SetsuLines from '../common/SetsuLines'
import SetsuLabels from '../common/SetsuLabels'
import SingleColumnLinks from './SingleColumnLinks'
import SingleColumnPoints from './SingleColumnPoints'
import { replaceEditorShapes, updateMapState } from '../../../actions'
import { EditorState } from '../../../reducers'

const axisWidth = 100
const xyAxisWidth = (ZUMEN_WIDTH - axisWidth) / 2

const xyCenterXScale = 1 / 64

/**
 * points の x座標もしくはy座標の平均値を求める
 * @param xy - x座標もしくはy座標のどちらかを指定する
 * @param points
 */
const calcXOrYAverage = (xy: XOrY, points: PointsType): number => {
  const xyValues = Object.values(points).map((point) => point[toXYKey(xy)])
  return mean(xyValues)
}

type SingleColumnXOrYProps = Readonly<{
  xy: XOrY
  genbaKey: string
  mapRef: React.RefObject<SVGMap> | null
  rootCoordRef: React.RefObject<SVGGElement> | null
  axisHeight: number
  toriName: string
  setsuList: SetsuListType
  singleColumnPoints: PointsType
  torishinValue: number | null
  mapState: MapState
  syncConfig: SyncConfigType
  editor: EditorState
  menuConfig: MenuConfigType
  clearTrans: Matrix
  getRootCTM: () => Matrix | null
  onEditorShapesReplace: typeof replaceEditorShapes
  onMapStateChange: typeof updateMapState
}>

const SingleColumnXOrY: React.FC<SingleColumnXOrYProps> = ({
  xy,
  genbaKey,
  mapRef,
  rootCoordRef,
  axisHeight,
  toriName,
  setsuList,
  singleColumnPoints,
  torishinValue,
  mapState,
  syncConfig,
  editor,
  menuConfig,
  clearTrans,
  getRootCTM,
  onEditorShapesReplace,
  onMapStateChange,
}) => {
  const {
    stagesDst,
    isShowGosaValues,
    isShowGosaArrows,
    isShowLinks,
    isShowGosaKanriAndGosaGenkai,
    gosaValueFontSize,
    columnSize,
    gosaScale,
    torishinSize,
    decimalDigits,
  } = menuConfig

  // 中央位置に描画するx座標もしくはy座標
  const xyCenterValue =
    torishinValue === null
      ? // torishinValue が指定されていない場合は描画対象のポイントの座標の平均値が中央位置に来るように描画する
        calcXOrYAverage(xy, singleColumnPoints)
      : torishinValue

  const xyCenterTrans = transform(
    translate(xyAxisWidth / 2, 0),
    scale(xyCenterXScale, 1),
    translate(-xyCenterValue, 0),
  )
  const xyCenterClearTrans = extendClearTrans(
    `${genbaKey}_xyCenterTrans`,
    mapState.zoom,
    xyCenterTrans,
    clearTrans,
  )
  const singleColumnBodyTrans = transform(
    xyCenterTrans,
    syncWithMapXFixedTrans(mapState, syncConfig),
  )
  const singleColumnBodyClearTrans = extendClearTrans(
    `${genbaKey}_singleColumnBodyTrans`,
    mapState.zoom,
    singleColumnBodyTrans,
    clearTrans,
  )

  const strokeWidthX = Math.round(DEFAULT_STROKE_WIDTH / singleColumnBodyTrans.a)
  const strokeWidthY = Math.round(DEFAULT_STROKE_WIDTH / singleColumnBodyTrans.d)

  const gosaStageDst = selectGosaStageDst(menuConfig)

  const linksElems = isShowLinks
    ? stagesDst.map((stage) => (
        <SingleColumnLinks
          key={stage}
          xy={xy}
          setsuList={setsuList}
          singleColumnPoints={singleColumnPoints}
          stage={stage}
          gosaScale={gosaScale}
          strokeWidth={strokeWidthX}
        />
      ))
    : null

  const pointsElems = stagesDst.map((stage) => (
    <SingleColumnPoints
      key={stage}
      xy={xy}
      setsuList={setsuList}
      singleColumnPoints={singleColumnPoints}
      stage={stage}
      isShowGosaValues={isShowGosaValues}
      isShowGosaArrows={isShowGosaArrows}
      isShowGosaKanriAndGosaGenkai={isShowGosaKanriAndGosaGenkai}
      gosaValueFontSize={gosaValueFontSize}
      columnSize={columnSize}
      gosaScale={gosaScale}
      gosaStageDst={gosaStageDst}
      decimalDigits={decimalDigits}
      clearTrans={singleColumnBodyClearTrans}
    />
  ))

  const bodyWidth = xyAxisWidth / xyCenterXScale
  const bodyHeight = (ZUMEN_HEIGHT - axisHeight) * 120
  const body = (
    <>
      <BenchGrid
        width={bodyWidth}
        height={bodyHeight}
        intervalX={1000}
        intervalY={1000}
        numIntervalX={10000}
        numIntervalY={10000}
        strokeWidth={strokeWidthX}
        clearTrans={singleColumnBodyClearTrans}
      />
      {torishinValue == null ? null : (
        <DashLine
          x1={torishinValue}
          y1={-INFINITY}
          x2={torishinValue}
          y2={INFINITY}
          strokeWidth={strokeWidthX}
        />
      )}
      <SetsuLines setsuList={setsuList} strokeWidth={strokeWidthY} dashScale={strokeWidthX} />
      {linksElems}
      {pointsElems}
    </>
  )

  return (
    <g className='svg-single-colunm-x-or-y'>
      <SVGLayer
        id={`svg-single-column-${xy}-axis`}
        x={axisWidth + (xy === XOrY.X ? 0 : xyAxisWidth)}
        y={0}
        width={xyAxisWidth}
        height={axisHeight}
        transformMat={xyCenterTrans}
      >
        <BenchGrid
          width={xyAxisWidth / xyCenterXScale}
          height={axisHeight}
          intervalX={1000}
          numIntervalX={10000}
          clearTrans={xyCenterClearTrans}
        />
        <ToriLabel
          x={xyCenterValue}
          y={torishinSize + 1}
          torishinSize={torishinSize}
          toriName={toriName}
          clearTrans={xyCenterClearTrans}
        />
      </SVGLayer>
      <SVGLayer
        id={`svg-single-column-${xy}-body`}
        x={axisWidth + (xy === XOrY.X ? 0 : xyAxisWidth)}
        y={axisHeight}
        width={xyAxisWidth}
        height={ZUMEN_HEIGHT - axisHeight}
        transformMat={singleColumnBodyTrans}
      >
        {xy === XOrY.X ? ( // SVGMapはXのときだけ描画すればok
          <SVGMap
            ref={mapRef}
            rootCoordRef={rootCoordRef}
            mapState={mapState}
            innerScale={syncConfig.innerScale}
            getRootCTM={getRootCTM}
            isMoveDisabled={!!editor.tool}
            onMapStateChange={onMapStateChange}
          >
            {body}
          </SVGMap>
        ) : (
          body
        )}
      </SVGLayer>
      {xy === XOrY.X ? ( // SVGEditorはXのときにXとYの分をまとめて描画する
        <SVGLayer
          id='svg-single-column-X-editor'
          x={axisWidth}
          y={axisHeight}
          width={xyAxisWidth * 2}
          height={ZUMEN_HEIGHT - axisHeight}
          transformMat={singleColumnBodyTrans}
        >
          <RTTShapeEditor
            genbaKey={genbaKey}
            zumenType={ZUMEN.SINGLE_COLUMN}
            editor={editor}
            clearTrans={singleColumnBodyClearTrans}
            onEditorShapesReplace={onEditorShapesReplace}
            children
          />
        </SVGLayer>
      ) : null}
    </g>
  )
}

type SingleColumnCommentProps = Readonly<{
  clearTrans: Matrix
}>

const SingleColumnComment: React.FC<SingleColumnCommentProps> = ({ clearTrans }) => {
  return (
    <SVGLayer x={0} y={ZUMEN_HEIGHT} transformMat={clearTrans} clip={false}>
      <rect x={ZUMEN_WIDTH - 125} y={0} width={ZUMEN_WIDTH} height='2.5em' fill='white' />
      <text>
        <tspan x={ZUMEN_WIDTH} dy='1em' textAnchor='end'>
          ()：管理許容誤差
        </tspan>
        <tspan x={ZUMEN_WIDTH} dy='1.2em' textAnchor='end'>
          []：限界許容誤差
        </tspan>
      </text>
    </SVGLayer>
  )
}

type SingleColumnProps = Readonly<{
  genbaKey: GenbaKeyType
  mapRef: React.RefObject<SVGMap> | null
  rootCoordRef: React.RefObject<SVGGElement> | null
  setsuList: SetsuListType
  singleColumnPoints: PointsType
  torishinX?: TorishinType
  torishinY?: TorishinType
  mapState: MapState
  syncConfig: SyncConfigType
  editor: EditorState
  menuConfig: MenuConfigType
  axisHeight: number
  clearTrans: Matrix
  getRootCTM: () => Matrix | null
  onEditorShapesReplace: typeof replaceEditorShapes
  onMapStateChange: typeof updateMapState
}>

const SingleColumn: React.FC<SingleColumnProps> = ({
  genbaKey,
  mapRef,
  rootCoordRef,
  setsuList,
  singleColumnPoints,
  torishinX,
  torishinY,
  mapState,
  syncConfig,
  editor,
  menuConfig,
  axisHeight,
  clearTrans,
  getRootCTM,
  onEditorShapesReplace,
  onMapStateChange,
}) => {
  const { isShowSetsuZValues, singleColumnXToriName, singleColumnYToriName } = menuConfig

  if (torishinX && torishinX[0].x !== torishinX[1].x) {
    throw new RTTDrawerError(`X通り ${singleColumnXToriName} が平行ではありません。`)
  }
  if (torishinY && torishinY[0].y !== torishinY[1].y) {
    throw new RTTDrawerError(`Y通り ${singleColumnYToriName} が平行ではありません。`)
  }
  const torishinXValue = torishinX ? torishinX[0].x : null
  const torishinYValue = torishinY ? torishinY[0].y : null

  const singleColumnZAxisTrans = syncWithMapXFixedTrans(mapState, syncConfig)
  const singleColumnZAxisClearTrans = extendClearTrans(
    `${genbaKey}_singleColumnZAxisTrans`,
    mapState.zoom,
    singleColumnZAxisTrans,
    clearTrans,
  )

  return (
    <g className='svg-single-column'>
      <SVGLayer
        id='svg-single-column-z-axis'
        x={0}
        y={axisHeight}
        width={axisWidth}
        height={ZUMEN_HEIGHT - axisHeight}
        transformMat={singleColumnZAxisTrans}
      >
        <BenchGrid
          width={axisWidth}
          height={(ZUMEN_HEIGHT - axisHeight) * 120}
          intervalX={100}
          intervalY={10000}
          clearTrans={singleColumnZAxisClearTrans}
        />
        <SetsuLabels
          setsuList={setsuList}
          zAxisWidth={axisWidth}
          isShowSetsuZValues={isShowSetsuZValues}
          clearTrans={singleColumnZAxisClearTrans}
        />
      </SVGLayer>
      <SingleColumnXOrY
        xy={XOrY.Y}
        genbaKey={genbaKey}
        mapRef={null}
        rootCoordRef={null}
        axisHeight={axisHeight}
        toriName={singleColumnYToriName}
        setsuList={setsuList}
        singleColumnPoints={singleColumnPoints}
        torishinValue={torishinYValue}
        mapState={mapState}
        syncConfig={syncConfig}
        editor={editor}
        menuConfig={menuConfig}
        clearTrans={clearTrans}
        getRootCTM={getRootCTM}
        onEditorShapesReplace={onEditorShapesReplace}
        onMapStateChange={onMapStateChange}
      />
      <SingleColumnXOrY
        xy={XOrY.X}
        genbaKey={genbaKey}
        mapRef={mapRef}
        rootCoordRef={rootCoordRef}
        axisHeight={axisHeight}
        toriName={singleColumnXToriName}
        setsuList={setsuList}
        singleColumnPoints={singleColumnPoints}
        torishinValue={torishinXValue}
        mapState={mapState}
        syncConfig={syncConfig}
        editor={editor}
        menuConfig={menuConfig}
        clearTrans={clearTrans}
        getRootCTM={getRootCTM}
        onEditorShapesReplace={onEditorShapesReplace}
        onMapStateChange={onMapStateChange}
      />
      <line
        x1={axisWidth + xyAxisWidth}
        y1={0}
        x2={axisWidth + xyAxisWidth}
        y2={ZUMEN_HEIGHT}
        stroke={getStageColor(BasicStage.KIH)}
      />
      {menuConfig.isShowGosaKanriAndGosaGenkai ? (
        <SingleColumnComment clearTrans={clearTrans} />
      ) : null}
    </g>
  )
}

export default SingleColumn
