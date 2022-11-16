import { RTTDrawerError } from './rttDrawerError'

export class PDFError extends RTTDrawerError {
  name = 'PDFError'

  constructor(message: string) {
    super(message)
    Object.setPrototypeOf(this, PDFError.prototype)
  }
}
