/**
 * frontend/src/common にあるコードの中で発生するエラーを表すクラス
 */
// TODO: toKGException メソッドの定義、継承整理
export class RTTCommonError extends Error {
  name = 'RTTCommonError'

  constructor(message: string) {
    super(message)
    // Error 継承時に必要な処理
    // 参照: https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, RTTCommonError.prototype)
  }
}
