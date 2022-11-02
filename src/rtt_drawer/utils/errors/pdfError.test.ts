import { PDFError } from './pdfError'
import { RTTDrawerError } from './rttDrawerError'

describe('エラーが正しく定義されていること', () => {
  test('PDFError が正しく定義されていること', () => {
    const error = new PDFError('test message')
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(RTTDrawerError)
    expect(error).toBeInstanceOf(PDFError)
    expect(error.toString()).toEqual('PDFError: test message')
  })
})
