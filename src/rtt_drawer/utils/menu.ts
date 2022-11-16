import objectHash from 'object-hash'
import { BasicStage, STAGE_ORDER, GenbaKeyType, GenbaDataType, Stage } from '../../common/types'
import { MenuConfigType, tempMenuConfigKeyRegExp, ZUMEN } from '../constants'
import { RTTDrawerError } from './errors'
import { selectZumen2dGosaStageSrcDst } from './zumen2d'

/**
 * genbaKeyをredux-formで使用するフォーム名に変換する
 * @param genbaKey
 * @returns フォーム名
 */
export const getMenuConfigFormName = (genbaKey: GenbaKeyType): string => `MENU_CONFIG_${genbaKey}`

/**
 * メニューの状態から比較先ステージを求める
 * @param menuConfig
 * @returns 比較先ステージ
 */
export const selectGosaStageDst = (menuConfig: MenuConfigType): Stage => {
  let gosaStageDst: Stage = BasicStage.KIH
  STAGE_ORDER.forEach((stage) => {
    if (menuConfig.stagesDst.includes(stage)) {
      gosaStageDst = stage
    }
  })
  return gosaStageDst
}

/**
 * MenuConfigのハッシュ値を計算する
 * @param menuConfig
 * @returns
 */
export const calcMenuConfigHash = (menuConfig: MenuConfigType): string => {
  return objectHash(menuConfig, {
    excludeKeys: (key) => !!tempMenuConfigKeyRegExp.exec(key),
  })
}

/**
 * ある値が ZUMEN 型かどうかを判断する
 * @param val - ZUMEN かどうかを判断したい値
 */
export const isZumen = (val: string): val is ZUMEN =>
  (Object.values(ZUMEN) as string[]).includes(val)

export const getSetsuOrToriName = (
  genbaData: GenbaDataType | null,
  zumenType: ZUMEN,
  menuConfig: MenuConfigType,
): string | null => {
  if (!genbaData) {
    return null
  }

  const { gaihekiTorishin } = genbaData.zentai
  const {
    heimenSetsuName,
    ritsumen1XToriName,
    ritsumen2YToriName,
    gaiheki1XKey,
    gaiheki2YKey,
    singleColumnXToriName,
    singleColumnYToriName,
  } = menuConfig

  switch (zumenType) {
    case ZUMEN.HEIMEN:
    case ZUMEN.SETSU_COMPARISON:
      return heimenSetsuName ? `${heimenSetsuName}節` : null
    case ZUMEN.RITSUMEN1:
      return ritsumen1XToriName ? `${ritsumen1XToriName}通り` : null
    case ZUMEN.RITSUMEN2:
      return ritsumen2YToriName ? `${ritsumen2YToriName}通り` : null
    case ZUMEN.GAIHEKI1: {
      const torishinName =
        gaihekiTorishin && gaiheki1XKey ? gaihekiTorishin[gaiheki1XKey] : undefined
      return torishinName === undefined ? null : `${torishinName}通り`
    }
    case ZUMEN.GAIHEKI2: {
      const torishinName =
        gaihekiTorishin && gaiheki2YKey ? gaihekiTorishin[gaiheki2YKey] : undefined
      return torishinName === undefined ? null : `${torishinName}通り`
    }
    case ZUMEN.SINGLE_COLUMN: {
      return singleColumnXToriName && singleColumnYToriName
        ? `${singleColumnXToriName}通り-${singleColumnYToriName}通り`
        : null
    }
    default:
      throw new RTTDrawerError(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `図面タイプの値が不正です。 zumenType: ${zumenType}`,
      )
  }
}

export const getGosaStageSrcDst = (
  zumenType: ZUMEN,
  menuConfig: MenuConfigType,
): {
  gosaStageSrc?: Stage
  gosaStageDst: Stage
} => {
  switch (zumenType) {
    case ZUMEN.HEIMEN:
    case ZUMEN.RITSUMEN1:
    case ZUMEN.RITSUMEN2:
    case ZUMEN.SETSU_COMPARISON:
      return selectZumen2dGosaStageSrcDst(menuConfig)
    case ZUMEN.GAIHEKI1:
    case ZUMEN.GAIHEKI2:
    case ZUMEN.SINGLE_COLUMN:
      return { gosaStageDst: selectGosaStageDst(menuConfig) }
    default:
      throw new RTTDrawerError(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `図面タイプの値が不正です。 zumenType: ${zumenType}`,
      )
  }
}
