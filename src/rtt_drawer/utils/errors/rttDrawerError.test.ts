import { RTTDrawerError } from './rttDrawerError'

describe('エラーが正しく定義されていること', () => {
  test('RTTDrawerError が正しく定義されていること', () => {
    const error = new RTTDrawerError('test message')
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(RTTDrawerError)
    expect(error.toString()).toEqual('RTTDrawerError: test message')
  })
})
