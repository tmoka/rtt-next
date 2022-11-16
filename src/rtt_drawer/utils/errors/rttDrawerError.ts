/**
 * rtt_drawer の一般的なエラーを表すクラス
 */
export class RTTDrawerError extends Error {
  name = 'RTTDrawerError'

  constructor(message: string) {
    super(message)
    Object.setPrototypeOf(this, RTTDrawerError.prototype)
  }
}
