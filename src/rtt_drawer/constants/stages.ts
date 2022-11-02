import {
  BasicStage,
  getStageIndex,
  isAdditionalStage,
  Stage,
  StageLatest,
} from '../../common/types'

/**
 * CSSの色を表す型
 */
export type CSSColor = string

const COLOR_KIH = '#000000'
const COLOR_TAT = '#d9534f'
const COLOR_HON = '#5bc0de'
const COLOR_YOU = '#337ab7'
const COLOR_CON = '#5cb85c'
const COLOR_LATEST = '#7952b3'

/**
 * 各ステージの色
 */
export const getStageColor = (stage: Stage): CSSColor => {
  switch (stage) {
    case BasicStage.KIH:
      return COLOR_KIH
    case BasicStage.TAT:
      return COLOR_TAT
    case BasicStage.HON:
      return COLOR_HON
    case BasicStage.YOU:
      return COLOR_YOU
    case BasicStage.CON:
      return COLOR_CON
    case StageLatest:
      return COLOR_LATEST
    default:
      if (isAdditionalStage(stage)) {
        const stageIdx = getStageIndex(stage)
        return [COLOR_TAT, COLOR_HON, COLOR_YOU, COLOR_CON][(stageIdx + 4 - 1) % 4]
      }
      return `#333333`
  }
}

// 節比較の比較元に用いる色
export const COLOR_SETSU_COMPARISON_SRC = '#ff8c00'

/**
 * 薄い線に使用する色
 */
export const colorMuted: CSSColor = '#999999'

/**
 * ステージと日本語名の対応
 */
export const stageToJa = (stage: Stage): string => {
  switch (stage) {
    case BasicStage.KIH:
      return '基本'
    case BasicStage.TAT:
      return '建て方後'
    case BasicStage.HON:
      return '本締め後'
    case BasicStage.YOU:
      return '溶接後'
    case BasicStage.CON:
      return 'コンクリート打設後'
    case StageLatest:
      return '最新状況'
    default:
      return `ステージ${stage.slice('STAGE'.length)}`
  }
}
