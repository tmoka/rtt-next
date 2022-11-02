import React, { useCallback } from 'react'
import { GenbaDataType } from '../../../common/types'
import {
  ZUMEN,
  MenuConfigType,
  GosaDisplayType,
  GOSA_DISPLAY_TYPE_TO_JA,
  EVENT_CATEGORY,
} from '../../constants'
import SetsuToriSelect from './SetsuToriSelect'
import Radio from './Radio'
import Checkbox from './Checkbox'
import RangeField from './RangeField'
import StagesSrcDstForm from './StagesSrcDstForm'

type RTTDrawerMenuFormProps = Readonly<{
  zumenType: ZUMEN
  menuConfig: MenuConfigType
  genbaData: GenbaDataType
  changeField: (field: string, value: any) => void // eslint-disable-line @typescript-eslint/no-explicit-any
}>

const RTTDrawerMenuForm: React.FC<RTTDrawerMenuFormProps> = ({
  zumenType,
  menuConfig,
  genbaData,
  changeField,
}) => {
  const { isShowColumnAll, gosaDisplayType } = menuConfig

  const setShowAdditionalStages = useCallback(
    (value: boolean) => changeField('isShowAdditionalStages', value),
    [changeField],
  )

  const isGosaDisplayTable = gosaDisplayType === GosaDisplayType.TABLE
  const zumenHeimenOrSetsuComparison =
    zumenType === ZUMEN.HEIMEN || zumenType === ZUMEN.SETSU_COMPARISON

  return (
    <form>
      {/* 節・通り選択 */}
      <SetsuToriSelect zumenType={zumenType} genbaData={genbaData} />

      {/* 比較元・比較先 */}
      <StagesSrcDstForm
        menuConfig={menuConfig}
        hideSrc={[ZUMEN.GAIHEKI1, ZUMEN.GAIHEKI2, ZUMEN.SINGLE_COLUMN].includes(zumenType)}
        zumenType={zumenType}
        setShowAdditionalStages={setShowAdditionalStages}
      />

      {/* 誤差表記方法 */}
      {zumenHeimenOrSetsuComparison ? (
        <div>
          誤差表記方法
          <div className='form-group row'>
            <div className='col'>
              <Radio
                name='gosaDisplayType'
                value={GosaDisplayType.VECTOR}
                label={GOSA_DISPLAY_TYPE_TO_JA[GosaDisplayType.VECTOR]}
                eventCategory={EVENT_CATEGORY.RTT_DRAWER_MENU}
                eventAction='GOSA_DISPLAY_TYPE_VECTOR'
              />
            </div>
            <div className='col'>
              <Radio
                name='gosaDisplayType'
                value={GosaDisplayType.TABLE}
                label={GOSA_DISPLAY_TYPE_TO_JA[GosaDisplayType.TABLE]}
                eventCategory={EVENT_CATEGORY.RTT_DRAWER_MENU}
                eventAction='GOSA_DISPLAY_TYPE_TABLE'
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* データ表示 */}
      <div style={{ margin: '5px 0' }}>
        {zumenHeimenOrSetsuComparison ? (
          <>
            <Checkbox
              name='isShowColumnAll'
              label='全柱データ表示'
              eventCategory={EVENT_CATEGORY.RTT_DRAWER_MENU}
              eventAction='IS_SHOW_COLUMN_ALL'
            />
            <Checkbox
              name='isShowColumnStageSrc'
              disabled={isShowColumnAll}
              label='比較元柱データ表示'
              eventCategory={EVENT_CATEGORY.RTT_DRAWER_MENU}
              eventAction='IS_SHOW_STAGE_SRC'
            />
            <Checkbox
              name='isShowColumnStageDst'
              disabled={isShowColumnAll}
              label='比較先柱データ表示'
              eventCategory={EVENT_CATEGORY.RTT_DRAWER_MENU}
              eventAction='IS_SHOW_STAGE_DST'
            />
          </>
        ) : null}
        <Checkbox
          name='isShowGosaValues'
          label='誤差数値表示'
          disabled={isGosaDisplayTable}
          eventCategory={EVENT_CATEGORY.RTT_DRAWER_MENU}
          eventAction='IS_SHOW_GOSA_VALUES'
        />
        {zumenType !== ZUMEN.GAIHEKI1 && zumenType !== ZUMEN.GAIHEKI2 ? (
          <Checkbox
            name='isShowGosaArrows'
            label='誤差矢印表示'
            disabled={isGosaDisplayTable}
            eventCategory={EVENT_CATEGORY.RTT_DRAWER_MENU}
            eventAction='IS_SHOW_GOSA_ARROWS'
          />
        ) : null}
        <Checkbox
          name='isShowLinks'
          label='結線表示'
          eventCategory={EVENT_CATEGORY.RTT_DRAWER_MENU}
          eventAction='IS_SHOW_LINKS'
        />
        {zumenHeimenOrSetsuComparison ? (
          <Checkbox
            name='isInfinityLink'
            label='結線延長表示'
            eventCategory={EVENT_CATEGORY.RTT_DRAWER_MENU}
            eventAction='IS_INFINITY_LINK'
          />
        ) : null}
        {!zumenHeimenOrSetsuComparison ? (
          <Checkbox
            name='isShowSetsuZValues'
            label='節数値表示'
            eventCategory={EVENT_CATEGORY.RTT_DRAWER_MENU}
            eventAction='IS_SHOW_SETSU_Z_VALUES'
          />
        ) : null}
        {zumenType === ZUMEN.SINGLE_COLUMN ? (
          <Checkbox
            name='isShowGosaKanriAndGosaGenkai'
            label='管理許容値・限界許容値表示'
            eventCategory={EVENT_CATEGORY.RTT_DRAWER_MENU}
            eventAction='IS_SHOW_GOSA_KANRI_AND_GOSA_GENKAI'
          />
        ) : null}
      </div>

      {/* サイズ調整 */}
      <div>
        <RangeField
          menuConfig={menuConfig}
          changeField={changeField}
          name='gosaValueFontSize'
          label='誤差数値サイズ'
          min={5}
          max={24}
          eventCategory={EVENT_CATEGORY.RTT_DRAWER_MENU}
          eventAction='GOSA_VALUE_FONT_SIZE'
        />
        {zumenType !== ZUMEN.GAIHEKI1 && zumenType !== ZUMEN.GAIHEKI2 ? (
          <RangeField
            menuConfig={menuConfig}
            changeField={changeField}
            name='gosaArrowSize'
            label='誤差矢印サイズ'
            min={5}
            max={20}
            eventCategory={EVENT_CATEGORY.RTT_DRAWER_MENU}
            eventAction='GOSA_ARROW_SIZE'
          />
        ) : null}
        <RangeField
          menuConfig={menuConfig}
          changeField={changeField}
          name='torishinSize'
          label='通り芯サイズ'
          min={5}
          max={30}
          eventCategory={EVENT_CATEGORY.RTT_DRAWER_MENU}
          eventAction='TORISHIN_SIZE'
        />
        <RangeField
          menuConfig={menuConfig}
          changeField={changeField}
          name='gosaScale'
          label='ズレの大きさ'
          min={10}
          max={200}
          eventCategory={EVENT_CATEGORY.RTT_DRAWER_MENU}
          eventAction='GOSA_SCALE'
        />
        <RangeField
          menuConfig={menuConfig}
          changeField={changeField}
          name='columnSize'
          label='柱サイズ'
          min={5}
          max={20}
          eventCategory={EVENT_CATEGORY.RTT_DRAWER_MENU}
          eventAction='COLUMN_SIZE'
        />
        <RangeField
          menuConfig={menuConfig}
          changeField={changeField}
          name='decimalDigits'
          label='小数点以下桁数'
          min={0}
          max={3}
          eventCategory={EVENT_CATEGORY.RTT_DRAWER_MENU}
          eventAction='DECIMAL_DIGITS'
        />
      </div>
    </form>
  )
}

export default RTTDrawerMenuForm
