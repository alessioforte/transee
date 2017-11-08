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

    this.state = { startLogin, checkAutomaticallyUpdates }
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
            <Label>Auto start at login</Label>
              <Checkbox
                value={this.state.startLogin}
                onClick={() => this.setStartAtLogin()}
              />
          </Option>

          <Option>
            <Label>Check automatically for updates</Label>
              <Checkbox
                value={this.state.checkAutomaticallyUpdates}
                onClick={() => this.setCheckAutomaticallyUpdates()}
              />
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
  justify-content: space-between;
  padding: 9px 18px;
  color: #aaa;
  border-bottom: 1px solid rgba(85, 85, 85, 0.3);
`

const Label = styled.div`
  padding: 12px 0;
  font-size: 12px;
`

render(<Preferences />, document.getElementById('root'))
