/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react'
import sortBy from 'lodash/sortBy'
import { orderBy } from 'natural-orderby'
import {
  GenbaDataType,
  GaihekiTorishinType,
  GaihekiKey,
  TorishinNamesType,
} from '../../../common/types'
import { XOrY, ZUMEN } from '../../constants'
import Select from './Select'

type ToriSelectProps = Readonly<{
  xy: XOrY
  torishinNames: TorishinNamesType
  name: string
  /** テスト用のid */
  dataTid?: string
}>

const ToriSelect: React.FC<ToriSelectProps> = ({ xy, torishinNames, name, dataTid }) => {
  const names = xy === XOrY.X ? torishinNames.x : torishinNames.y
  const options = orderBy(names).map((toriName) => ({
    title: toriName,
    value: toriName,
  }))

  return <Select name={name} options={options} dataTid={dataTid} />
}

type GaihekiSelectProps = Readonly<{
  xy: XOrY
  gaihekiTorishin: GaihekiTorishinType
  name: string
}>

const GaihekiSelect: React.FC<GaihekiSelectProps> = ({ xy, gaihekiTorishin, name }) => {
  const keys = xy === XOrY.X ? [GaihekiKey.X_M, GaihekiKey.X_P] : [GaihekiKey.Y_M, GaihekiKey.Y_P]
  const options = gaihekiTorishin
    ? keys
        .map((key) => ({
          title: gaihekiTorishin[key] || '',
          value: key,
        }))
        .filter((option) => option.title)
    : []
  return <Select name={name} options={options} />
}

type SetsuToriSelectProps = Readonly<{
  zumenType: ZUMEN
  genbaData: GenbaDataType
}>

const SetsuToriSelect: React.FC<SetsuToriSelectProps> = ({ zumenType, genbaData }) => {
  switch (zumenType) {
    case ZUMEN.HEIMEN: {
      const name = 'heimenSetsuName'
      const label = '節'
      const { setsuList } = genbaData.zentai
      const options = sortBy(Object.keys(setsuList), (setsuName) => setsuList[setsuName]) // z 座標でソート
        .map((setsuName) => ({
          title: setsuName,
          value: setsuName,
        }))
      return (
        <div className='form-group row'>
          <div className='col'>
            <Select name={name} options={options} dataTid='setsu-select' />
          </div>
          <label className='col-auto select-label'>{label}</label>
        </div>
      )
    }
    case ZUMEN.RITSUMEN1: {
      const label = '通り'
      return (
        <div className='form-group row'>
          <div className='col'>
            <ToriSelect
              xy={XOrY.X}
              torishinNames={genbaData.torishinNames}
              name='ritsumen1XToriName'
            />
          </div>
          <label className='col-auto select-label'>{label}</label>
        </div>
      )
    }
    case ZUMEN.RITSUMEN2: {
      const label = '通り'
      return (
        <div className='form-group row'>
          <div className='col'>
            <ToriSelect
              xy={XOrY.Y}
              torishinNames={genbaData.torishinNames}
              name='ritsumen2YToriName'
            />
          </div>
          <label className='col-auto select-label'>{label}</label>
        </div>
      )
    }
    case ZUMEN.GAIHEKI1: {
      const label = '通り'
      return (
        <div className='form-group row'>
          <div className='col'>
            <GaihekiSelect
              xy={XOrY.X}
              gaihekiTorishin={genbaData.zentai.gaihekiTorishin}
              name='gaiheki1XKey'
            />
          </div>
          <label className='col-auto select-label'>{label}</label>
        </div>
      )
    }
    case ZUMEN.GAIHEKI2: {
      const label = '通り'
      return (
        <div className='form-group row'>
          <div className='col'>
            <GaihekiSelect
              xy={XOrY.Y}
              gaihekiTorishin={genbaData.zentai.gaihekiTorishin}
              name='gaiheki2YKey'
            />
          </div>
          <label className='col-auto select-label'>{label}</label>
        </div>
      )
    }
    case ZUMEN.SINGLE_COLUMN: {
      const label = '通り'
      return (
        <div>
          <div className='form-group row'>
            <div className='col'>
              <ToriSelect
                xy={XOrY.X}
                torishinNames={genbaData.torishinNames}
                name='singleColumnXToriName'
                dataTid='x-tori-select'
              />
            </div>
            <label className='col-auto select-label'>{label}</label>
          </div>
          <div className='form-group row'>
            <div className='col'>
              <ToriSelect
                xy={XOrY.Y}
                torishinNames={genbaData.torishinNames}
                name='singleColumnYToriName'
                dataTid='y-tori-select'
              />
            </div>
            <label className='col-auto select-label'>{label}</label>
          </div>
        </div>
      )
    }
    case ZUMEN.SETSU_COMPARISON: {
      const nameSrc = 'setsuComparisonSrcName'
      const nameDst = 'setsuComparisonDstName'
      const label = '節'
      const { setsuList } = genbaData.zentai
      const options = sortBy(Object.keys(setsuList), (setsuName) => setsuList[setsuName]) // z 座標でソート
        .map((setsuName) => ({
          title: setsuName,
          value: setsuName,
        }))
      return (
        <div className='form-group row'>
          <div className='col'>
            <Select name={nameSrc} options={options} dataTid='setsu-select-src' />
          </div>
          <label className='col-auto select-label'>{label}</label>
          <div className='col'>
            <Select name={nameDst} options={options} dataTid='setsu-select-dst' />
          </div>
          <label className='col-auto select-label'>{label}</label>
        </div>
      )
    }
    default:
      return null
  }
}

export default SetsuToriSelect
