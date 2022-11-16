/**
 * genbaKeyをredux-formで使用するフォーム名に変換する
 * @param genbaKey
 * @returns フォーム名
 */
export const getHeaderInfoFormName = (genbaKey: string): string => `HEADER_INFO_${genbaKey}`
