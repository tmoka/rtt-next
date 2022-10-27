import React, { useCallback } from 'react'
import { reduxForm, InjectedFormProps } from 'redux-form'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import { GenbaDataType } from '../../common/types'
import { DOWNLOAD_PDF_REQUEST, PDFAction, resetMapState } from '../actions'
import { ZUMEN, defaultMenuConfig, MenuConfigType, EVENT_CATEGORY } from '../constants'
import ButtonWithTracking from './common/ButtonWithTracking'
import ErrorBoundary from './common/ErrorBoundary'
import RTTDrawerMenuForm from './menu/RTTDrawerMenuForm'

const ResetButtonPopover = (
  <Popover id='reset-button-popover' title='リセット'>
    描画メニューをリセットします。
  </Popover>
)

const overlayDelayConfig = { show: 1000, hide: 200 }

type RTTDrawerMenuOwnProps = Readonly<{
  zumenType: ZUMEN
  menuConfig: MenuConfigType
  genbaData: GenbaDataType | null
  statusDownloadPDF?: PDFAction
  onMapStateReset: typeof resetMapState
  onPDFDownload: () => void
}>

type RTTDrawerMenuProps = RTTDrawerMenuOwnProps &
  InjectedFormProps<MenuConfigType, RTTDrawerMenuOwnProps>

const RTTDrawerMenu: React.FC<RTTDrawerMenuProps> = ({
  zumenType,
  menuConfig,
  genbaData,
  statusDownloadPDF,
  onMapStateReset,
  onPDFDownload,
  change: changeField,
  reset,
}) => {
  const handleReset = useCallback((): void => {
    reset()
    // mapState もリセットする
    onMapStateReset()
  }, [onMapStateReset, reset])

  const isDownloadingPDF = statusDownloadPDF && statusDownloadPDF.type === DOWNLOAD_PDF_REQUEST

  return (
    <div className='rtt-drawer-menu'>
      <div className='mb-2 d-flex'>
        <OverlayTrigger placement='right' delay={overlayDelayConfig} overlay={ResetButtonPopover}>
          <ButtonWithTracking
            eventCategory={EVENT_CATEGORY.RTT_DRAWER_MENU}
            eventAction='RESET'
            className='mr-2'
            variant='secondary'
            size='sm'
            onClick={handleReset}
          >
            <i className='mr-2 fas fa-times-circle' />
            リセット
          </ButtonWithTracking>
        </OverlayTrigger>
        <ButtonWithTracking
          eventCategory={EVENT_CATEGORY.RTT_DRAWER_MENU}
          eventAction='DOWNLOAD_PDF'
          className='mr-2'
          variant='info'
          size='sm'
          onClick={onPDFDownload}
          disabled={isDownloadingPDF}
          data-tid='pdf-button'
        >
          {isDownloadingPDF ? (
            <i className='mr-2 fas fa-spinner fa-spin' />
          ) : (
            <i className='mr-2 fas fa-download' />
          )}
          pdf
        </ButtonWithTracking>
      </div>

      <ErrorBoundary>
        {genbaData ? (
          <RTTDrawerMenuForm
            zumenType={zumenType}
            menuConfig={menuConfig}
            genbaData={genbaData}
            changeField={changeField}
          />
        ) : (
          '現場データが空です'
        )}
      </ErrorBoundary>
    </div>
  )
}

export default reduxForm<MenuConfigType, RTTDrawerMenuOwnProps>({
  initialValues: defaultMenuConfig,
  destroyOnUnmount: false,
})(RTTDrawerMenu)
