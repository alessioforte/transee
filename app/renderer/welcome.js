import React, { Component } from 'react'
import { render } from 'react-dom'
import { Checkbox } from './components/checkbox'
import styled from 'styled-components'
import './components/css/styles.css'
import icon from '../../dist/assets/icon_256x256.png'

const settings = require('electron-settings')
const { webFrame } = require('electron')
webFrame.setZoomLevelLimits(1, 1)

class Welcome extends Component {
  constructor() {
    super()
    var showWelcome = settings.has('show-welcome') ? settings.get('show-welcome') : true
    this.state = {
      display: true,
      showWelcome
    }
  }

  changeView() {
    this.setState({ display: !this.state.display })
  }

  setShowWelcomeGuide() {
    let check = !this.state.showWelcome
    this.setState({ showWelcome: check })
    settings.set('show-welcome', check)
  }

  render() {
    return (
      <Win>
        <Frame
          style={{ display: `${window.navigator.platform === 'MacIntel' ? 'block' : 'none'}`}}
        >
          Welcome Guide
        </Frame>

        <Header>
          <img src={icon} height="80px"/>
          <div>
            <Title>Transee</Title>
            <Details>Simple and usefull tool for quick translation</Details>
          </div>
        </Header>

        <Instructions style={{ display: this.state.display ? 'block' : 'none' }}>
          <View>
            <Button onClick={() => this.changeView()}>
              see other shortcuts
            </Button>
          </View>
          Press <Short>Ctrl+T</Short><br />
          and starts translating 🎉<br />
          press <Short>Esc</Short> to hide the search bar<br />
          that's it! 😉
        </Instructions>

        <Shortcuts style={{ display: this.state.display ? 'none' : 'block' }}>
          <View>
            <Button onClick={() => this.changeView()}>
              Instructions
            </Button>
          </View>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <Row><Short>Alt+Shift</Short></Row>
              <Row><Short>Ctrl+P</Short></Row>
              <Row><Short>Ctrl+O</Short></Row>
            </div>
            <div style={{ textAlign: 'left' }}>
              <Row>Invert languages</Row>
              <Row>Listen voice</Row>
              <Row>Listen translated voice</Row>
            </div>
          </div>
        </Shortcuts>

        <Option>
          <Checkbox
            value={this.state.showWelcome}
            onClick={() => this.setShowWelcomeGuide()}
          />
          <Label>Show Welcome Guide when opening Transee</Label>
        </Option>
      </Win>
    )
  }
}

const frameColor = 'rgba(26, 26, 26, 1)'

const Win = styled.div`
  color: #fff;
  user-select: none;
  cursor: default;
`
const Frame = styled.div`
  color: #aaa;
  background: ${frameColor};
  padding-top: 5px;
  height: 18px;
  font-size: 12px;
  text-align: center;
  -webkit-app-region: drag;
  -webkit-user-select: none
`
const Header = styled.div`
  margin: 0 18px;
  display: flex;
  justify-content: space-between;
  padding: 3px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`
const Title = styled.div`
  text-align: right;
  margin-top: 10px;
  font-size: 26px;
`
const Details = styled.div`
  color: #999;
  font-size: 16px;
`
const View = styled.div`
  margin: 3px 0;
  display: flex;
  flex-direction: row-reverse;
  font-size: 12px;
`
const Shortcuts = styled.div`
  margin: 9px 18px;
  text-align: center;
`
const Instructions = styled.div`
  margin: 9px 18px;
  text-align: center;
  font-size: 18px;
`
const Button = styled.div`
  color: #0077B5;
  &:hover {
    color: #00AFF0;
  }
`
const Row = styled.div`
  margin: 9px 3px;
`
const Short = styled.div`
  display: inline;
  padding: 1px 9px;
  background: #2182BD;
  border-radius: 3px;
  font-size: 14px;
`
const Option = styled.div`
  box-sizing: border-box;
  position: absolute;
  bottom: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 9px 18px;
  color: #aaa;
  border-top: 1px solid rgba(85, 85, 85, 0.3);
`
const Label = styled.div`
  margin-left: 9px;
  padding: 12px 0;
  font-size: 12px;
`

render(<Welcome />, document.getElementById('root'))
