/**
 * STEP 3. json -> GenbaData 変換 関連の utils
 */

import { RTTLoaderError, CSVKind } from './rttLoaderError'

/**
 * STEP 3. json -> GenbaData 変換 でのエラー
 */
export class RTTLoaderConvertError extends RTTLoaderError {
  name = 'RTTLoaderConvertError'

  constructor(csvKind: CSVKind, userMessage: string) {
    super(`${userMessage}\nファイル: ${csvKind}.csv`)
    Object.setPrototypeOf(this, RTTLoaderConvertError.prototype)
  }
}
