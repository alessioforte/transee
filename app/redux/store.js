import { createStore, combineReducers } from 'redux'
import * as reducers from './reducers'

const settings = require('electron-settings')

const state = {
  langs: {
    from: 'en',
    to: 'it'
  },
  speed: {
    from: false,
    to: false
  },
  fromBar: {
    from1: 'en',
    from2: 'it',
    from3: 'es'
  },
  toBar: {
    to1: 'it',
    to2: 'en',
    to3: 'es'
  },
  fromActive: [true, false, false],
  toActive: [true, false, false],
  isTransparent: false
}

var initialState = settings.has('settings') ? settings.get('settings') : state

const allReducers = combineReducers(reducers)
export const store = createStore(allReducers, initialState)
