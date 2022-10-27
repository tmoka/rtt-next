import React, { useState, useCallback } from 'react'
import { Toast, Fade } from 'react-bootstrap'
import {
  GET_GENBA_BY_KEY_REQUEST,
  GET_GENBA_BY_KEY_SUCCESS,
  GET_GENBA_BY_KEY_FAILURE,
  LOAD_AND_CACHE_FONTS_REQUEST,
  LOAD_AND_CACHE_FONTS_SUCCESS,
  LOAD_AND_CACHE_FONTS_FAILURE,
  DOWNLOAD_PDF_REQUEST,
  DOWNLOAD_PDF_SUCCESS,
  DOWNLOAD_PDF_FAILURE,
  AsyncAction,
} from '../../actions'
import { RTTDrawerError } from '../../utils'

/**
 * async action の状態
 */
enum STATUS {
  REQUEST = 'REQUEST', // リクエスト中
  SUCCESS = 'SUCCESS', // 成功
  FAILURE = 'FAILURE', // 失敗
}

const statusToBgColor = {
  [STATUS.REQUEST]: 'rgba(248, 249, 250, 0.85)',
  [STATUS.SUCCESS]: 'rgba(40, 167, 69, 0.85)',
  [STATUS.FAILURE]: 'rgba(220, 53, 69, 0.85)',
}

const statusToIcon = {
  [STATUS.REQUEST]: <i className='mr-2 fas fa-spinner fa-spin' />,
  [STATUS.SUCCESS]: <i className='mr-2 fas fa-check' />,
  [STATUS.FAILURE]: <i className='mr-2 fas fa-exclamation' />,
}

const statusToTextColor = {
  [STATUS.REQUEST]: 'body',
  [STATUS.SUCCESS]: 'white',
  [STATUS.FAILURE]: 'white',
}

const kindToTitle = {
  GET_GENBA_BY_KEY: '現場データ取得',
  LOAD_AND_CACHE_FONTS: 'フォントダウンロード',
  DOWNLOAD_PDF: 'pdf作成',
}

const getAsyncActionKind = (
  action: AsyncAction,
): 'GET_GENBA_BY_KEY' | 'LOAD_AND_CACHE_FONTS' | 'DOWNLOAD_PDF' => {
  switch (action.type) {
    case GET_GENBA_BY_KEY_REQUEST:
    case GET_GENBA_BY_KEY_SUCCESS:
    case GET_GENBA_BY_KEY_FAILURE:
      return 'GET_GENBA_BY_KEY'
    case LOAD_AND_CACHE_FONTS_REQUEST:
    case LOAD_AND_CACHE_FONTS_SUCCESS:
    case LOAD_AND_CACHE_FONTS_FAILURE:
      return 'LOAD_AND_CACHE_FONTS'
    case DOWNLOAD_PDF_REQUEST:
    case DOWNLOAD_PDF_SUCCESS:
    case DOWNLOAD_PDF_FAILURE:
      return 'DOWNLOAD_PDF'
    default:
      throw new RTTDrawerError('不明なエラーが発生しました')
  }
}

type AsyncStatusItemProps = Readonly<{
  /** 発行中のaction */
  action: AsyncAction
}>

const AsyncStatusItem: React.FC<AsyncStatusItemProps> = ({ action }) => {
  const [isShow, setIsShow] = useState(true)
  const handleClose = useCallback(() => {
    setIsShow(false)
  }, [])

  let status
  let message
  switch (action.type) {
    case GET_GENBA_BY_KEY_REQUEST:
      status = STATUS.REQUEST
      message = '現場データを取得しています ...'
      break
    case GET_GENBA_BY_KEY_SUCCESS:
      status = STATUS.SUCCESS
      message = '現場データを取得しました'
      break
    case LOAD_AND_CACHE_FONTS_REQUEST:
      status = STATUS.REQUEST
      message = 'フォントファイルをダウンロードしています ...'
      break
    case LOAD_AND_CACHE_FONTS_SUCCESS:
      status = STATUS.SUCCESS
      message = 'フォントファイルをダウンロードしました'
      break
    case DOWNLOAD_PDF_REQUEST:
      status = STATUS.REQUEST
      message = 'pdfを作成しています ...'
      break
    case DOWNLOAD_PDF_SUCCESS:
      status = STATUS.SUCCESS
      message = 'pdfの作成が完了しました'
      break
    case GET_GENBA_BY_KEY_FAILURE:
    case LOAD_AND_CACHE_FONTS_FAILURE:
    case DOWNLOAD_PDF_FAILURE: {
      status = STATUS.FAILURE
      const { error } = action.payload
      message = error.name === 'Error' ? '不明なエラーが発生しました' : error.toString()
      break
    }
    default:
  }
  if (!status) {
    return null
  }

  const kind = getAsyncActionKind(action)
  const title = kindToTitle[kind]

  return (
    <Toast
      autohide={status === STATUS.SUCCESS}
      delay={5000}
      show={isShow}
      onClose={handleClose}
      transition={Fade}
      style={{ backgroundColor: statusToBgColor[status] }}
    >
      <Toast.Header>
        {statusToIcon[status]}
        <strong className='mr-auto'>{title}</strong>
      </Toast.Header>
      <Toast.Body>
        <span className={`text-${statusToTextColor[status]}`}>{message}</span>
      </Toast.Body>
    </Toast>
  )
}

export default React.memo(AsyncStatusItem)
