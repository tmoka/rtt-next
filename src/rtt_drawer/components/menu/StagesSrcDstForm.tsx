import React, { useMemo } from 'react'
import {
  BasicStage,
  isAdditionalStage,
  Stage,
  StageLatest,
  STAGE_ORDER,
} from '../../../common/types'
import { EVENT_CATEGORY, getStageColor, MenuConfigType, stageToJa, ZUMEN } from '../../constants'
import CheckboxGroup from './CheckboxGroup'
import Radio from './Radio'

type StageSrcDstFormProps = Readonly<{
  menuConfig: MenuConfigType
  hideSrc?: boolean
  zumenType: ZUMEN
  setShowAdditionalStages: (value: boolean) => void
}>

const getStageStyle = (stage: Stage, isSrc: boolean): React.CSSProperties => {
  if (stage === BasicStage.KIH) {
    return {}
  }
  if (!isAdditionalStage(stage)) {
    return {
      backgroundColor: getStageColor(stage),
      color: '#ffffff',
      width: '100%',
    }
  }
  return {
    borderRight: isSrc ? 'none' : `4px solid ${getStageColor(stage)}`,
    width: '100%',
  }
}

const StagesSrcDstForm: React.FC<StageSrcDstFormProps> = ({
  menuConfig,
  hideSrc = false,
  zumenType,
  setShowAdditionalStages,
}) => {
  const { isShowAdditionalStages, stagesDstRaw } = menuConfig
  const isStageDstLatest = stagesDstRaw.includes(StageLatest)
  const displayStages = useMemo(
    () =>
      isShowAdditionalStages
        ? STAGE_ORDER
        : STAGE_ORDER.filter((stage) => !isAdditionalStage(stage)),
    [isShowAdditionalStages],
  )
  const stagesDstOptions = useMemo(
    () =>
      displayStages.map((stage) => ({
        label: stageToJa(stage),
        value: stage,
        disabled: stage === BasicStage.KIH || (isStageDstLatest && stage !== StageLatest),
        style: getStageStyle(stage, false),
        labelTextClass: stage === BasicStage.CON || isAdditionalStage(stage) ? 'small' : undefined,
        eventCategory: EVENT_CATEGORY.RTT_DRAWER_MENU,
        eventAction: `STAGE_DST_${stage}`,
        dataTid: `stage-dst-${stage.toLowerCase()}-check`,
      })),
    [isStageDstLatest, displayStages],
  )

  return (
    <div className='form-group row'>
      {hideSrc ? null : (
        <>
          <div className='col'>
            <div>比較元</div>
            {displayStages.map((stage) => {
              if (zumenType !== ZUMEN.SETSU_COMPARISON && stage === StageLatest) {
                return null
              }
              return (
                <div key={stage} style={getStageStyle(stage, true)}>
                  <Radio
                    name='stageSrc'
                    value={stage}
                    label={stageToJa(stage)}
                    labelTextClass={
                      stage === BasicStage.CON || isAdditionalStage(stage) ? 'small' : undefined
                    }
                    eventCategory={EVENT_CATEGORY.RTT_DRAWER_MENU}
                    eventAction={`STAGE_SRC_${stage}`}
                  />
                </div>
              )
            })}
          </div>
          <div className='float-center'>
            <i className='fas fa-arrow-right' />
          </div>
        </>
      )}
      <div className='col'>
        <div>
          比較先
          <button
            type='button'
            className='float-right btn btn-link'
            style={{ padding: 0, lineHeight: 1 }}
            onClick={() => setShowAdditionalStages(!isShowAdditionalStages)}
          >
            <small>
              <small>{isShowAdditionalStages ? '一部表示' : '全表示'}</small>
            </small>
          </button>
        </div>
        <CheckboxGroup name='stagesDstRaw' options={stagesDstOptions} />
      </div>
    </div>
  )
}

export default StagesSrcDstForm
