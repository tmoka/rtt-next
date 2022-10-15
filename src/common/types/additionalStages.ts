/**
 * 「梅田三丁目計画」向け2機械座標統合機能用の型定義
 */

/**
 * x軸, y軸, z軸のいずれかを表す型
 */
export enum AXIS {
  X = 'x',
  Y = 'y',
  Z = 'z',
}

/**
 * CVSPointRow 用の追加ステージの key
 */
export const additionalStageColumnKeys = [
  'stage01X',
  'stage01Y',
  'stage01Z',
  'stage02X',
  'stage02Y',
  'stage02Z',
  'stage03X',
  'stage03Y',
  'stage03Z',
  'stage04X',
  'stage04Y',
  'stage04Z',
  'stage05X',
  'stage05Y',
  'stage05Z',
  'stage06X',
  'stage06Y',
  'stage06Z',
  'stage07X',
  'stage07Y',
  'stage07Z',
  'stage08X',
  'stage08Y',
  'stage08Z',
  'stage09X',
  'stage09Y',
  'stage09Z',
  'stage10X',
  'stage10Y',
  'stage10Z',

  'stage11X',
  'stage11Y',
  'stage11Z',
  'stage12X',
  'stage12Y',
  'stage12Z',
  'stage13X',
  'stage13Y',
  'stage13Z',
  'stage14X',
  'stage14Y',
  'stage14Z',
  'stage15X',
  'stage15Y',
  'stage15Z',
  'stage16X',
  'stage16Y',
  'stage16Z',
  'stage17X',
  'stage17Y',
  'stage17Z',
  'stage18X',
  'stage18Y',
  'stage18Z',
  'stage19X',
  'stage19Y',
  'stage19Z',
  'stage20X',
  'stage20Y',
  'stage20Z',

  'stage21X',
  'stage21Y',
  'stage21Z',
  'stage22X',
  'stage22Y',
  'stage22Z',
  'stage23X',
  'stage23Y',
  'stage23Z',
  'stage24X',
  'stage24Y',
  'stage24Z',
  'stage25X',
  'stage25Y',
  'stage25Z',
  'stage26X',
  'stage26Y',
  'stage26Z',
  'stage27X',
  'stage27Y',
  'stage27Z',
  'stage28X',
  'stage28Y',
  'stage28Z',
  'stage29X',
  'stage29Y',
  'stage29Z',
  'stage30X',
  'stage30Y',
  'stage30Z',
] as const
export type AdditionalStageColumnKey = typeof additionalStageColumnKeys[number]

/** 追加ステージ */
export const additionalStages = [
  'STAGE01',
  'STAGE02',
  'STAGE03',
  'STAGE04',
  'STAGE05',
  'STAGE06',
  'STAGE07',
  'STAGE08',
  'STAGE09',
  'STAGE10',

  'STAGE11',
  'STAGE12',
  'STAGE13',
  'STAGE14',
  'STAGE15',
  'STAGE16',
  'STAGE17',
  'STAGE18',
  'STAGE19',
  'STAGE20',

  'STAGE21',
  'STAGE22',
  'STAGE23',
  'STAGE24',
  'STAGE25',
  'STAGE26',
  'STAGE27',
  'STAGE28',
  'STAGE29',
  'STAGE30',
] as const
/** 追加ステージの型 */
export type AdditionalStage = typeof additionalStages[number]

/** 追加ステージ番号の最大値 */
export const MAX_ADDITIONAL_STAGE = 30

/**
 * CVSPointRow 用の追加ステージの key を取得する
 * @param stageNum ステージ番号
 * @param axis X, Y, Z のいずれか
 */
export const getAdditionalStageColumnKey = (
  stageNum: number,
  axis: AXIS,
): AdditionalStageColumnKey =>
  `stage${`${stageNum}`.padStart(2, '0')}${axis.toUpperCase()}` as AdditionalStageColumnKey

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export const isAdditionalStage = (stage: any): stage is AdditionalStage =>
  typeof stage === 'string' && stage.startsWith('STAGE')

/**
 * stage のステージ番号を取得する
 * @param stage
 */
export const getStageIndex = (stage: AdditionalStage): number =>
  parseInt(stage.slice('STAGE'.length), 10)
