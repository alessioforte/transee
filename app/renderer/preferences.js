import React, { Component } from 'react'
import { render } from 'react-dom'
import styled from 'styled-components'
import { Checkbox } from './components/checkbox'
import './components/css/styles.css'

const settings = require('electron-settings')
const ipc = require('electron').ipcRenderer
const { webFrame } = require('electron')
webFrame.setZoomLevelLimits(1, 1)

class Preferences extends Component {

  constructor() {
    super()
    var startLogin = settings.has('start-login') ? settings.get('start-login') : false
    var checkAutomaticallyUpdates = settings.has('check-automatically-updates') ?
      settings.get('check-automatically-updates') : true

    this.state = {
      startLogin,
      checkAutomaticallyUpdates,
      record: 'Click to record new shortcut'
    }

    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleKeyUp = this.handleKeyUp.bind(this)
  }

  setStartAtLogin() {
    let check = !this.state.startLogin
    this.setState({ startLogin: check })
    settings.set('start-login', check)
    ipc.send('set-start-login', check)
  }

  setCheckAutomaticallyUpdates() {
    let check = !this.state.checkAutomaticallyUpdates
    this.setState({ checkAutomaticallyUpdates: check })
    settings.set('check-automatically-updates', check)
  }

  handleRecordOnClick() {
    document.addEventListener('keydown', this.handleKeyDown)
    document.addEventListener('keyup', this.handleKeyUp)
  }

  handleKeyDown(e) {
    let key = e.key
    if (key === 'Meta') key = 'Command'
    if (key === 'Escape') key = 'Esc'
    console.log(key)
    this.setState({
      record: key
    })
  }

  handleKeyUp(e) {
    this.setState({ record: '' })
  }

  render() {
    return (
      <Win>
        <Frame
          style={{ display: `${window.navigator.platform === 'MacIntel' ? 'block' : 'none'}`}}
        >
          Preferences
        </Frame>
        <div>

          <Option>
            <Label>
              Auto start at login
              <Checkbox
                value={this.state.startLogin}
                onClick={() => this.setStartAtLogin()}
              />
            </Label>
          </Option>

          <Option>
            <Label>
              Check automatically for updates
              <Checkbox
                value={this.state.checkAutomaticallyUpdates}
                onClick={() => this.setCheckAutomaticallyUpdates()}
              />
            </Label>
          </Option>

          <Option>
            <Label>
              Define a shortcut
              <Record
                onClick={() => this.handleRecordOnClick()}
              >
                <div
                  ref={record => this.record = record}
                >
                  {this.state.record}
                </div>
              </Record>
            </Label>
          </Option>

        </div>
      </Win>
    )
  }
}

const headerColor = 'rgba(26, 26, 26, 1)'

const Win = styled.div`
  dislay: flex;
  flex-direction: column;
  user-select: none;
  cursor: default;
`
const Frame = styled.div`
  color: #aaa;
  background: ${headerColor};
  padding-top: 5px;
  height: 18px;
  font-size: 12px;
  text-align: center;
  -webkit-app-region: drag;
  -webkit-user-select: none
`
const Option = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80px;
  padding: 0 18px;
  color: #aaa;
  border-bottom: 1px solid rgba(85, 85, 85, 0.3);
`
const Label = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0;
  font-size: 14px;
`
const Record = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  background: #999;
  width: 200px;
  height: 50px;
  border-radius: 5px;
  color: #1a1a1a;
  font-size: 12px;
`

render(<Preferences />, document.getElementById('root'))
