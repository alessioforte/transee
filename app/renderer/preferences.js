import React, { Component } from 'react'
import { render } from 'react-dom'
import './components/css/preferences.css'

const settings = require('electron-settings')
const ipc = require('electron').ipcRenderer

class Preferences extends Component {
  render() {
    return (
      <div className='preferences'>
        <div className='header'>Preferences</div>
        <div>
          <div className='option'>
            <div className='label'>Auto start at login</div>
            <Checkbox />
          </div>
        </div>
      </div>
    )
  }
}

class Checkbox extends Component {
  constructor() {
    super()

    var value = settings.has('start-login') ? settings.get('start-login') : false

    this.state = { value }
  }

  onoff() {
    let check = !this.state.value
    this.setState({ value: check })
    settings.set('start-login', check)
    ipc.send('set-start-login', check)
  }

  render() {
    return (
      <div
        className={ this.state.value ? 'checkbox on' : 'checkbox'}
        onClick={() => this.onoff()}
      >
        <svg
          className='checkIcon'
          style={{
            display: this.state.value ? 'block' : 'none'
          }}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 141.73 109.5"
        >
          <path d="M71.27,133.67a8.75,8.75,0,0,1-6,2.73,7.68,7.68,0,0,1-3.49-.83,11.51,11.51,0,0,1-2.9-2.22C57,131.43,15.78,90.26,15.1,89.2A8.53,8.53,0,0,1,13.84,86,8.1,8.1,0,0,1,16,79.38c0.9-1,1.9-2,2.86-2.91l5.93-5.93c0.9-.89,1.76-1.82,2.71-2.66a8.17,8.17,0,0,1,6.64-2.2,8.43,8.43,0,0,1,3.12,1.22c1,0.65,27.73,27.59,27.92,27.79L128.31,31.5c0.74-.74,1.46-1.51,2.24-2.22a8.69,8.69,0,0,1,5.11-2.36,8,8,0,0,1,5.29,1.63c0.76,0.55,12.4,12.2,13,13a8,8,0,0,1,1.54,5.33,8.71,8.71,0,0,1-2.33,4.94c-0.68.76-1.44,1.46-2.16,2.19l-2.28,2.28-77.4,77.4h0Z" transform="translate(-13.74 -26.9)"/>
        </svg>
      </div>
    )
  }
}

render(<Preferences />, document.getElementById('root'))
