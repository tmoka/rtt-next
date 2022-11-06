import React from 'react'
import { connect } from 'react-redux'
import isEmpty from 'lodash/isEmpty'
import sortBy from 'lodash/sortBy'
import memoizeOne from 'memoize-one'
import { FormState } from 'redux-form'
import RTTDrawer from '../components/RTTDrawer'
import GenbaErrors from '../components/GenbaErrors'
import {
  replaceEditorShapes,
  updateMapState,
  resetMapState,
  changeZumenType,
  GET_GENBA_BY_KEY_SUCCESS,
  DownloadPDFAACType,
  setEditorTool,
} from '../actions'
import {
  BasicStage,
  defaultGenba,
  defaultRTTWebGenba,
  GenbaKeyType,
  GenbaType,
  Stage,
  StageLatest,
  STAGE_ORDER,
} from '../../common/types'
import {
  ZUMEN,
  defaultZumenType,
  defaultMenuConfig,
  MapState,
  MenuConfigType,
  HeaderInfoType,
} from '../constants'
import { RootState, AsyncStatusState, initialEditorSetState, EditorSetState } from '../reducers'
import { getMenuConfigFormName, calcMenuConfigHash, getHeaderInfoFormName } from '../utils'
import AsyncStatus from '../components/common/AsyncStatus'

type StateProps = Readonly<{
  genba: GenbaType
  asyncStatus: AsyncStatusState
  mapState: MapState
  zumenType: ZUMEN
  editorSet: EditorSetState
  menuConfig: MenuConfigType
  headerInfo: HeaderInfoType
}>

type DispatchProps = Readonly<{
  onEditorToolSet: typeof setEditorTool
  onEditorShapesReplace: typeof replaceEditorShapes
  onMapStateChange: typeof updateMapState
  onMapStateReset: typeof resetMapState
  onZumenTypeChange: typeof changeZumenType
}>

type OwnProps = Readonly<{
  genbaKey: GenbaKeyType
  onPDFDownload: DownloadPDFAACType
}>

type RTTDrawerContainerProps = StateProps & DispatchProps & OwnProps

const RTTDrawerContainer: React.FC<RTTDrawerContainerProps> = ({
  genbaKey,
  genba,
  asyncStatus,
  mapState,
  zumenType,
  editorSet,
  menuConfig,
  headerInfo,
  onEditorToolSet,
  onEditorShapesReplace,
  onPDFDownload,
  onMapStateChange,
  onMapStateReset,
  onZumenTypeChange,
}) => {
  const { statusGetGenbaByKey } = asyncStatus
  console.log('statusGetGenbaByKey: ', statusGetGenbaByKey)

  return (
    <div className='rtt-drawer-container'>
      <div
        aria-live='polite'
        aria-atomic='true'
        className='position-sticky w-100'
        style={{ zIndex: 1020 }}
      >
        <div
          className='position-absolute my-5'
          style={{
            top: 0,
            right: 0,
            width: '350px',
          }}
        >
          <AsyncStatus asyncStatus={asyncStatus} />
        </div>
      </div>
      <GenbaErrors errors={genba.errors || []} />
      {statusGetGenbaByKey &&
      statusGetGenbaByKey.type === GET_GENBA_BY_KEY_SUCCESS &&
      !isEmpty(genba.genbaData) &&
      isEmpty(genba.errors) ? (
        <RTTDrawer
          genbaKey={genbaKey}
          rttwebGenba={genba.rttwebGenba || defaultRTTWebGenba}
          genbaData={genba.genbaData}
          asyncStatus={asyncStatus}
          mapState={mapState}
          zumenType={zumenType}
          editorSet={editorSet}
          menuConfig={menuConfig}
          headerInfo={headerInfo}
          onEditorToolSet={onEditorToolSet}
          onEditorShapesReplace={onEditorShapesReplace}
          onPDFDownload={onPDFDownload}
          onMapStateChange={onMapStateChange}
          onMapStateReset={onMapStateReset}
          onZumenTypeChange={onZumenTypeChange}
        />
      ) : null}
    </div>
  )
}

/**
 * redux-form の state からメニューの設定値を取り出す
 * @param menuForm - redux-form の state
 * @returns メニューの設定値
 */
const mapMenuFormToMenuConfig = memoizeOne((formState: FormState): MenuConfigType => {
  const menuFormValues = formState && formState.values ? formState.values : {}
  const menuConfig: MenuConfigType = {
    ...defaultMenuConfig,
    ...menuFormValues,
  }

  // メニューの比較先のチェックボックスをもとに、比較先ステージの配列を作成する
  const isStageDstLatest = menuConfig.stagesDstRaw.includes(StageLatest)
  let stagesDst: Stage[]
  if (isStageDstLatest) {
    stagesDst = [BasicStage.KIH, StageLatest]
  } else if (menuConfig.isShowColumnAll) {
    stagesDst = [BasicStage.KIH, BasicStage.TAT, BasicStage.HON, BasicStage.YOU, BasicStage.CON]
  } else {
    stagesDst = sortBy(menuConfig.stagesDstRaw, (stage) => STAGE_ORDER.indexOf(stage))
  }

  return {
    ...menuConfig,
    stagesDst,
    hash: calcMenuConfigHash(menuConfig),
  }
})

/**
 * redux-form の state から HeaderInfo の設定値を取り出す
 * @param menuForm - redux-form の state
 * @returns メニューの設定値
 */
const mapHeaderInfoFormToHeaderInfo = memoizeOne((formState: FormState): HeaderInfoType => {
  return formState && formState.values ? formState.values : {}
})

const mapStateToProps = (state: RootState, ownProps: OwnProps): StateProps => {
  const { genbas, asyncStatus, mapState, zumenTypes, editorSets, form } = state
  const { genbaKey } = ownProps
  const genba = genbas[genbaKey] || defaultGenba
  const zumenType = zumenTypes[genbaKey] || defaultZumenType
  const editorSet = editorSets[genbaKey] || initialEditorSetState
  const menuConfigFormName = getMenuConfigFormName(genbaKey)
  const menuConfig = mapMenuFormToMenuConfig(form[menuConfigFormName])
  const headerInfoFormName = getHeaderInfoFormName(genbaKey)
  const headerInfo = mapHeaderInfoFormToHeaderInfo(form[headerInfoFormName])

  return {
    genba,
    asyncStatus,
    mapState,
    zumenType,
    editorSet,
    menuConfig,
    headerInfo,
  }
}

const mapDispatchToProps: DispatchProps = {
  onEditorToolSet: setEditorTool,
  onEditorShapesReplace: replaceEditorShapes,
  onMapStateChange: updateMapState,
  onMapStateReset: resetMapState,
  onZumenTypeChange: changeZumenType,
}

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
  mapStateToProps,
  mapDispatchToProps,
)(RTTDrawerContainer)
