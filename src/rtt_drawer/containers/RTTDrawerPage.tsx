import React from 'react'
import { connect } from 'react-redux'
import { GenbaKeyType } from '../../common/types'
import { getGenbaByKey, downloadPDF, GetGenbaByKeyAACType, DownloadPDFAACType } from '../actions'
import { fontsConfigOnWeb, asyncDownloadBase64 } from '../constants'
import { RootState } from '../reducers'
import RTTDrawerContainer from './RTTDrawerContainer'

type StateProps = Readonly<{}>

type DispatchProps = Readonly<{
  getGenbaByKey: GetGenbaByKeyAACType
  onPDFDownload: DownloadPDFAACType
}>

type OwnProps = Readonly<{
  genbaKey: GenbaKeyType
}>

type RTTDrawerPageProps = StateProps & DispatchProps & OwnProps

class RTTDrawerPage extends React.Component<RTTDrawerPageProps> {
  public componentDidMount(): void {
    const { genbaKey } = this.props
    this.props.getGenbaByKey(genbaKey) // eslint-disable-line react/destructuring-assignment
  }

  public render(): React.ReactNode {
    const { genbaKey, onPDFDownload } = this.props
    console.log("GETGENBABYKEY", getGenbaByKey(genbaKey))
    return <RTTDrawerContainer genbaKey={genbaKey} onPDFDownload={onPDFDownload} />
  }
}

const mapStateToProps = (): StateProps => ({})

const mapDispatchToProps: DispatchProps = {
  getGenbaByKey,
  onPDFDownload: (svgNode, genbaData, zumenType, menuConfig, genbaName) =>
    downloadPDF(
      svgNode,
      genbaData,
      zumenType,
      menuConfig,
      genbaName,
      // ここで web 用の fontsConfig と loadFontFile を与えておくことで、
      // RTTDrawerContainer 以下で web と electron の差異を意識せず済むようにする
      fontsConfigOnWeb,
      asyncDownloadBase64,
    ),
}

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
  mapStateToProps,
  mapDispatchToProps,
)(RTTDrawerPage)
