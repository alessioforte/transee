import { translate, voice } from '../google-translate/api'
import { store } from '../redux/store'
import {
  updateObj,
  updateSgt,
  updateTSgt,
  setError,
  setToLang,
  setFromLang,
  setToBar,
  setFromBar,
  setToActive,
  setFromActive,
  speedFrom,
  speedTo } from '../redux/actions'

const ipc = require('electron').ipcRenderer
const { webFrame } = require('electron')
webFrame.setZoomLevelLimits(1, 1)

ipc.on('settings', (event, msg) => {
  const settings = require('electron-settings')
  var s = store.getState()
  var obj = {
    langs: s.langs,
    speed: s.speed,
    fromActive: s.fromActive,
    toActive: s.toActive,
    fromBar: s.fromBar,
    toBar: s.toBar
  }
  settings.set('settings', obj)
})

window.onkeydown = e => {
  if (e.keyCode === 27) {
    e.preventDefault()
    ipc.send('hide-window', 'hide')
  }

  if (e.altKey && e.keyCode === 16) {
    invertLanguages()
  }

  if (e.ctrlKey && e.keyCode === 80) {
    e.preventDefault()
    let text = document.getElementById('input').value
    if (text === '') return

    let from = store.getState().langs.from
    let speed = store.getState().speed.from
    playAudio(text, from, speed)
    store.dispatch(speedFrom(!speed))
  }

  if (e.ctrlKey && e.keyCode === 79) {
    e.preventDefault()
    if (document.getElementById('translation')) {
      let text = document.getElementById('translation').value
      if (text === '') return

      let to = store.getState().langs.to
      let speed = store.getState().speed.to
      playAudio(text, to, speed)
      store.dispatch(speedTo(!speed))
    } else return
  }
}

export const searchTranslation = (text, from, to) => {
  store.dispatch(speedFrom(false))
  store.dispatch(speedTo(false))

  translate(text, { from: from, to: to }).then(obj => {
    store.dispatch(updateObj(obj))
  }).catch(err => {
    store.dispatch(setError(true))
    console.error(err)
  })
}

export const playAudio = (text, lang, speed) => {
  voice(text, lang, speed).then(res => {
    var audio = new Audio(res)
    audio.play()
  }).catch(err => console.error(err))
}

export const getToPosition = (value) => {
  let toBar = store.getState().toBar
  if (value === toBar.to1) return [true, false, false]
  if (value === toBar.to2) return [false, true, false]
  if (value === toBar.to3) return [false, false, true]
  return null
}

export const getFromPosition = (value) => {
  let fromBar = store.getState().fromBar
  if (value === fromBar.from1) return [true, false, false]
  if (value === fromBar.from2) return [false, true, false]
  if (value === fromBar.from3) return [false, false, true]
  return null
}

export const setMainWindowSize = () => {
  var height = document.getElementById('root').scrollHeight
  ipc.send('window-height', height)
}

export const invertLanguages = () => {
  document.getElementById('autocomplete').value = ''
  store.dispatch(updateSgt(null))
  store.dispatch(updateTSgt(null))
  let langs = store.getState().langs
  let from = langs.from
  let to = langs.to

  store.dispatch(setToLang(from))
  store.dispatch(setFromLang(to))

  let toPos = getToPosition(from)
  let fromPos = getFromPosition(to)

  if (!toPos) {
    let toActive = store.getState().toActive
    let i = toActive.indexOf(true)
    store.dispatch(setToBar(from, i))
  } else {
    store.dispatch(setToActive(toPos))
  }

  if (!fromPos) {
    let fromActive = store.getState().fromActive
    let i = fromActive.indexOf(true)
    store.dispatch(setFromBar(to, i))
  } else {
    store.dispatch(setFromActive(fromPos))
  }

  if (document.getElementById('translation')) {
    let text = document.getElementById('translation').value
    let input = document.getElementById('input')
    input.value = text
    searchTranslation(text, to, from)
  }
}
