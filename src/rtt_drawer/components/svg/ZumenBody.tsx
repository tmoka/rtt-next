/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react'
import isEmpty from 'lodash/isEmpty'
import { Matrix } from 'transformation-matrix'
import { GenbaDataType, GenbaKeyType } from '../../../common/types'
import { replaceEditorShapes, updateMapState } from '../../actions'
import { MapState, MenuConfigType, ZUMEN } from '../../constants'
import { EditorSetState } from '../../reducers'
import {
  calcInnerTranslateAndScale,
  calcMapConfig,
  selectGaiheki,
  selectSingleColumnPoints,
  selectZumen2d,
  selectTwoHeimens,
} from '../../utils'
import NoData from './common/NoData'
import Gaiheki1 from './gaiheki/Gaiheki1'
import Gaiheki2 from './gaiheki/Gaiheki2'
import SingleColumn from './singleColumn/SingleColumn'
import SVGMap from './SVGMap'
import Zumen2d from './zumen2d/Zumen2d'

type ZumenBodyProps = Readonly<{
  genbaKey: GenbaKeyType
  /** SVGMapを指すref */
  mapRef: React.RefObject<SVGMap> | null
  rootCoordRef: React.RefObject<SVGGElement> | null
  genbaData: GenbaDataType | null
  mapState: MapState
  zumenType: ZUMEN
  editorSet: EditorSetState
  menuConfig: MenuConfigType
  clearTrans: Matrix
  getRootCTM: () => Matrix | null
  onEditorShapesReplace: typeof replaceEditorShapes
  onMapStateChange: typeof updateMapState
}>

const ZumenBody: React.FC<ZumenBodyProps> = ({
  genbaKey,
  mapRef,
  rootCoordRef,
  genbaData,
  mapState,
  zumenType,
  editorSet,
  menuConfig,
  clearTrans,
  getRootCTM,
  onEditorShapesReplace,
  onMapStateChange,
}) => {
  const mapConfig = calcMapConfig(genbaData, zumenType, menuConfig)
  if (!genbaData || !mapConfig) {
    return <NoData text='現場データが空です' clearTrans={clearTrans} />
  }
  const syncConfig = calcInnerTranslateAndScale(mapConfig)

  const editor = editorSet[zumenType]

  switch (zumenType) {
    case ZUMEN.HEIMEN:
    case ZUMEN.RITSUMEN1:
    case ZUMEN.RITSUMEN2: {
      const zumen2d = selectZumen2d(genbaData, menuConfig, zumenType)
      if (!zumen2d || isEmpty(zumen2d.points)) {
        return (
          <NoData
            text={`${zumenType === ZUMEN.HEIMEN ? '節' : '通り'}を選択してください`}
            clearTrans={clearTrans}
          />
        )
      }

      const { torishinList, setsuList } = genbaData.zentai
      const { axisWidth, axisHeight } = mapConfig

      return (
        <Zumen2d
          zumenType={zumenType}
          genbaKey={genbaKey}
          mapRef={mapRef}
          rootCoordRef={rootCoordRef}
          zumen2d={zumen2d}
          torishinList={torishinList}
          setsuList={setsuList}
          mapState={mapState}
          syncConfig={syncConfig}
          editor={editor}
          menuConfig={menuConfig}
          axisWidth={axisWidth!}
          axisHeight={axisHeight!}
          clearTrans={clearTrans}
          getRootCTM={getRootCTM}
          onEditorShapesReplace={onEditorShapesReplace}
          onMapStateChange={onMapStateChange}
        />
      )
    }
    case ZUMEN.SINGLE_COLUMN: {
      const { singleColumnXToriName, singleColumnYToriName } = menuConfig
      const singleColumnPoints = selectSingleColumnPoints(genbaData, menuConfig)
      if (!singleColumnXToriName || !singleColumnYToriName || isEmpty(singleColumnPoints)) {
        return <NoData text='通りを選択してください' clearTrans={clearTrans} />
      }

      const { setsuList, torishinList } = genbaData.zentai
      const torishinX = torishinList[singleColumnXToriName]
      const torishinY = torishinList[singleColumnYToriName]
      const { axisHeight } = mapConfig

      return (
        <SingleColumn
          genbaKey={genbaKey}
          mapRef={mapRef}
          rootCoordRef={rootCoordRef}
          setsuList={setsuList}
          singleColumnPoints={singleColumnPoints}
          torishinX={torishinX}
          torishinY={torishinY}
          mapState={mapState}
          syncConfig={syncConfig}
          editor={editor}
          menuConfig={menuConfig}
          axisHeight={axisHeight!}
          clearTrans={clearTrans}
          getRootCTM={getRootCTM}
          onEditorShapesReplace={onEditorShapesReplace}
          onMapStateChange={onMapStateChange}
        />
      )
    }
    case ZUMEN.GAIHEKI1: {
      const gaihekiData = selectGaiheki(genbaData, menuConfig, zumenType)
      if (isEmpty(gaihekiData.points)) {
        return <NoData text='通りを選択してください' clearTrans={clearTrans} />
      }

      const { setsuList, torishinList } = genbaData.zentai
      const { axisWidth, axisHeight, shearHeight, shearDegree } = mapConfig

      return (
        <Gaiheki1
          genbaKey={genbaKey}
          mapRef={mapRef}
          rootCoordRef={rootCoordRef}
          mapState={mapState}
          syncConfig={syncConfig}
          editor={editor}
          menuConfig={menuConfig}
          axisWidth={axisWidth!}
          axisHeight={axisHeight!}
          shearHeight={shearHeight!}
          shearDegree={shearDegree!}
          clearTrans={clearTrans}
          getRootCTM={getRootCTM}
          onEditorShapesReplace={onEditorShapesReplace}
          onMapStateChange={onMapStateChange}
          setsuList={setsuList}
          torishinList={torishinList}
          gaihekiData={gaihekiData}
        />
      )
    }
    case ZUMEN.GAIHEKI2: {
      const gaihekiData = selectGaiheki(genbaData, menuConfig, zumenType)
      if (isEmpty(gaihekiData.points)) {
        return <NoData text='通りを選択してください' clearTrans={clearTrans} />
      }

      const { setsuList, torishinList } = genbaData.zentai
      const { axisWidth, axisHeight, shearHeight, shearDegree } = mapConfig

      return (
        <Gaiheki2
          genbaKey={genbaKey}
          mapRef={mapRef}
          rootCoordRef={rootCoordRef}
          mapState={mapState}
          syncConfig={syncConfig}
          editor={editor}
          menuConfig={menuConfig}
          axisWidth={axisWidth!}
          axisHeight={axisHeight!}
          shearHeight={shearHeight!}
          shearDegree={shearDegree!}
          clearTrans={clearTrans}
          getRootCTM={getRootCTM}
          onEditorShapesReplace={onEditorShapesReplace}
          onMapStateChange={onMapStateChange}
          setsuList={setsuList}
          torishinList={torishinList}
          gaihekiData={gaihekiData}
        />
      )
    }
    case ZUMEN.SETSU_COMPARISON: {
      const twoHeimens = selectTwoHeimens(genbaData, menuConfig)

      if (!twoHeimens.heimenDst || isEmpty(twoHeimens.heimenDst.points)) {
        return <NoData text='節を選択してください' clearTrans={clearTrans} />
      }

      const { torishinList, setsuList } = genbaData.zentai
      const { axisWidth, axisHeight } = mapConfig

      return (
        <Zumen2d
          zumenType={zumenType}
          genbaKey={genbaKey}
          mapRef={mapRef}
          rootCoordRef={rootCoordRef}
          zumen2d={twoHeimens.heimenDst}
          torishinList={torishinList}
          setsuList={setsuList}
          mapState={mapState}
          syncConfig={syncConfig}
          editor={editor}
          menuConfig={menuConfig}
          axisWidth={axisWidth!}
          axisHeight={axisHeight!}
          clearTrans={clearTrans}
          twoHeimens={twoHeimens}
          getRootCTM={getRootCTM}
          onEditorShapesReplace={onEditorShapesReplace}
          onMapStateChange={onMapStateChange}
        />
      )
    }
    default:
      return null
  }
}

export default React.memo(ZumenBody)
