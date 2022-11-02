import { RTTCommonError } from './errors'

describe('エラーが正しく定義されていること', () => {
  test('RTTCommonError が正しく定義されていること', () => {
    const error = new RTTCommonError('test message')
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(RTTCommonError)
    expect(error.toString()).toEqual('RTTCommonError: test message')
  })
})
