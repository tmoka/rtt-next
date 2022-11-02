import React, { useCallback, useState } from 'react'
import { Button, Form, Row, Col, Modal } from 'react-bootstrap'
import { Field, InjectedFormProps, reduxForm } from 'redux-form'
import { HeaderInfoType, EVENT_CATEGORY } from '../../constants'
import TextInput from './TextInput'
import DateInput from './DateInput'
import ButtonWithTracking from '../common/ButtonWithTracking'

type HeaderInfoFormOwnProps = Readonly<{}>

type HeaderInfoFormProps = HeaderInfoFormOwnProps &
  InjectedFormProps<HeaderInfoType, HeaderInfoFormOwnProps>

/**
 * SVG上部の現場情報を編集するフォームを modal 表示するコンポーネント
 */
const HeaderInfoForm: React.FC<HeaderInfoFormProps> = ({ reset }) => {
  /**
   * モーダルを表示中かどうかを示す state
   */
  const [isModalShow, setIsModalShow] = useState(false)

  const handleModalOpen = useCallback(() => setIsModalShow(true), [])
  const handleModalClose = useCallback(() => setIsModalShow(false), [])
  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      handleModalClose()
    },
    [handleModalClose],
  )

  return (
    <>
      <ButtonWithTracking
        eventCategory={EVENT_CATEGORY.RTT_SVG_VIEWER}
        eventAction='OPEN_HEADER_INFO_EDITOR'
        variant='light'
        size='sm'
        onClick={handleModalOpen}
      >
        <i className='mr-2 fas fa-edit' />
        現場情報編集
      </ButtonWithTracking>

      <Modal
        size='lg'
        aria-labelledby='header-info-editor-modal'
        centered
        show={isModalShow}
        onHide={handleModalClose}
      >
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title id='header-info-editor-modal'>現場情報</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group as={Row} controlId='header-info-form-genba-name' className='mb-2'>
              <Form.Label column sm={2}>
                現場名
              </Form.Label>
              <Col sm={10}>
                <Field name='genbaName' component={TextInput} />
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId='header-info-form-comment' className='mb-2'>
              <Form.Label column sm={2}>
                コメント
              </Form.Label>
              <Col sm={10}>
                <Field name='comment' component={TextInput} />
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId='header-info-form-measured-at' className='mb-2'>
              <Form.Label column sm={2}>
                計測日
              </Form.Label>
              <Col sm={10}>
                <Field name='measuredAt' component={DateInput} />
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId='header-info-form-measured-by' className='mb-2'>
              <Form.Label column sm={2}>
                計測者
              </Form.Label>
              <Col sm={10}>
                <Field name='measuredBy' component={TextInput} />
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId='header-info-form-confirmed-by' className='mb-2'>
              <Form.Label column sm={2}>
                確認者
              </Form.Label>
              <Col sm={10}>
                <Field name='confirmedBy' component={TextInput} />
              </Col>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button type='button' variant='secondary' onClick={reset}>
              リセット
            </Button>
            <Button type='submit'>保存</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  )
}

export default reduxForm<HeaderInfoType, HeaderInfoFormOwnProps>({
  destroyOnUnmount: false,
})(HeaderInfoForm)
