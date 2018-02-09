import React, { Component } from 'react'
import { render } from 'react-dom'
import styled from 'styled-components'
import { Checkbox } from '../components/checkbox'
import { frameColor } from '../colors'
import '../styles.css'

const settings = require('electron-settings')
const ipc = require('electron').ipcRenderer
const { webFrame } = require('electron')
webFrame.setZoomLevelLimits(1, 1)

class Preferences extends Component {

  constructor() {
    super()
    var startLogin = settings.get('start-login') || false
    var checkAutomaticallyUpdates = settings.has('check-automatically-updates') ?
      settings.get('check-automatically-updates') : true

    var shortcutInSettings = settings.get('shortcut')
    var shortcut = shortcutInSettings || 'Click to record new shortcut'
    var shortStyle = shortcutInSettings ? successShortStyle : defaultShortStyle
    var showDelete = shortcutInSettings ? true : false

    this.state = {
      startLogin,
      checkAutomaticallyUpdates,
      shortcut,
      shortStyle,
      showDelete,
      char: '',
      modifier: ''
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

  clickOnRecord() {
    this.setState({
      shortcut: 'Type shortcut',
      showDelete: true,
      shortStyle: null
    })
    document.addEventListener('keydown', this.handleKeyDown)
    document.addEventListener('keyup', this.handleKeyUp)
  }

  handleKeyDown(e) {
    e.preventDefault()

    let shift = e.shiftKey ? 'Shift+' : ''
    let ctrl = e.ctrlKey ? 'Ctrl+' : ''
    let alt = e.altKey ? 'Alt+' : ''
    let cmd = e.metaKey ? 'Cmd+' : ''
    let modifier = shift + ctrl + alt + cmd
    let keyCode = e.keyCode
    let char = ''

    if ((keyCode > 47 && keyCode < 58) || (keyCode > 64 && keyCode < 91)) {
      char = String.fromCharCode(keyCode)
    }

    this.setState({
      modifier,
      char,
      shortcut: modifier + char,
      shortStyle: null
    })
  }

  handleKeyUp(e) {
    let modifier = this.state.modifier
    let isCmdOrCtrl = /cmd|ctrl/i.test(modifier)

    if (!isCmdOrCtrl || this.state.char === '') {
      this.setState({
        shortcut: 'Please type valid shortcut',
        shortStyle: errorShortStyle
      })
    } else {
      this.setState({
        shortStyle: successShortStyle
      })
      settings.set('shortcut', this.state.shortcut)
      ipc.send('change-shortcut', this.state.shortcut)
      document.removeEventListener('keydown', this.handleKeyDown)
      document.removeEventListener('keyup', this.handleKeyUp)
    }
  }

  clickOnDelete(e) {
    e.stopPropagation()
    ipc.send('delete-shortcut', null)

    this.setState({
      shortcut: 'Click to record new shortcut',
      showDelete: false,
      shortStyle: defaultShortStyle
    })
    document.removeEventListener('keydown', this.handleKeyDown)
    document.removeEventListener('keyup', this.handleKeyUp)
  }

  restoreSettings() {
    settings.deleteAll()
    ipc.send('restore-settings')
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
                onClick={!this.state.showDelete ? () => this.clickOnRecord() : null}
              >
                <Short
                  style={this.state.shortStyle}
                >
                  {this.state.shortcut}
                </Short>

                <Delete
                  style={{display: this.state.showDelete ? 'block' : 'none'}}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 461.31 461.31"
                  width='12px'
                  onClick={(e) => this.clickOnDelete(e)}
                >
                  <path d="M421.85,67C294.47,67,191.2,170.25,191.2,297.64S294.47,528.29,421.85,528.29,652.51,425,652.51,297.64,549.24,67,421.85,67ZM533.8,237.3l-61,61,58.87,58.87a36.19,36.19,0,1,1-53.21,48.6l-56.56-56.56-59.57,59.57a36.19,36.19,0,1,1-48.6-53.21L371,298.32l-57.9-57.9a36.19,36.19,0,1,1,47.07-54.72h0l61.72,61.72,57.19-57.19a36.19,36.19,0,1,1,54.72,47.07h0Z" transform="translate(-191.2 -66.99)"/>
                </Delete>
              </Record>
            </Label>
            <Comment>
              The shortcut must contain at least ctrl or cmd, you can add shift or alt if you want, and finally a letter or number.
              Pay attention to not use a system shortcuts or any other that can interfere with other programs.
            </Comment>
          </Option>

          <Option>
            <Label>
              Restore default settings
              <Button
                onClick={() => this.restoreSettings()}
              >
                Restore
              </Button>
            </Label>
            <Comment>
              Transee will be restarted.
            </Comment>
          </Option>

        </div>
      </Win>
    )
  }
}

const defaultShortStyle = {
  color: '#2182BD'
}

const errorShortStyle = {
  color: 'palevioletred'
}

const successShortStyle = {
  background: '#2182BD',
  color: '#fff'
}

const Win = styled.div`
  dislay: flex;
  flex-direction: column;
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
const Option = styled.div`
  height: auto;
  padding: 14px 18px;
  color: #ccc;
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
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-around;
  box-sizing: border-box;
  background: #333;
  width: 230px;
  height: 50px;
  border-radius: 5px;
  color: #fff;
  font-size: 14px;
`
const Delete = styled.svg`
  position: absolute;
  top: 16px;
  right: 9px;
  fill: #555;
  margin: 3px;
  &:hover {
    fill: #999;
  }
`
const Short = styled.div`
  padding: 9px;
  border-radius: 5px;
`
const Comment = styled.div`
  font-size: 12px;
  color: #999;
  padding-top: 9px;
`
const Button = styled.div`
  background: #2182BD;
  color: #fff;
  padding: 3px 16px;
  border-radius: 5px;
  &:hover {
    background: #238ed1;
  }
  &:active {
    box-shadow: inset 0 0 10px 1px #0464a0;
  }
`

render(<Preferences />,document.getElementById('root'))
