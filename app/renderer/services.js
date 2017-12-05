import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/fromEvent'
import 'rxjs/add/observable/fromPromise'
import 'rxjs/add/observable/empty'
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/debounceTime'
import 'rxjs/add/operator/concatMap'
import { translate, complete, translateComplete, voice } from '../google-translate/api'
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
  speedTo,
  setTrasparency } from '../redux/actions'

var input, autocomplete

const ipc = require('electron').ipcRenderer
const { webFrame } = require('electron')
webFrame.setZoomLevelLimits(1, 1)

const settings = require('electron-settings')

ipc.on('set-transparency', (event, check) => {
  store.dispatch(setTrasparency(check))
})

window.eval = global.eval = function() {
  throw new Error("Sorry, Transee does not support eval() for security reasons.");
}

window.onkeydown = e => {

  if (e.keyCode === 27) {
    e.preventDefault()
    ipc.send('hide-window', 'hide')
  }

  if (e.altKey && e.keyCode === 16) {
    invertLanguages()
  }

  if (e.ctrlKey && !e.altKey && e.keyCode === 80) {
    e.preventDefault()
    let text = document.getElementById('input').value
    if (text === '') return

    let from = store.getState().langs.from
    let speed = store.getState().speed.from
    playAudio(text, from, speed)
    store.dispatch(speedFrom(!speed))
  }

  if (e.ctrlKey && e.altKey && e.keyCode === 80) {
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

  if (e.shiftKey && e.ctrlKey && e.altKey && e.keyCode === 8) {
    ipc.send('devtools', null)
  }
}

export const createObservableOnInput = () => {
  input = document.getElementById('input')
  autocomplete = document.getElementById('autocomplete')

  const streamTranslate = Observable.fromEvent(input, 'input')
    .map(e => input.value)
    .debounceTime(250)
    .concatMap((text, i) => {

      if (!text || /^\s*$/.test(text)) {
        store.dispatch(setError(false))
        store.dispatch(updateObj(null))
        return Observable.empty()
      }
      let langs = {
        from: store.getState().langs.from,
        to: store.getState().langs.to
      }
      return Observable
        .fromPromise(translate(text, langs))
        .catch(err => {
          store.dispatch(setError(true))
          console.error(err)
          return Observable.empty()
        })
    })
    .subscribe(obj => {
      store.dispatch(updateObj(obj))
      store.dispatch(speedFrom(false))
      store.dispatch(speedTo(false))
    })

  const streamComplete = Observable.fromEvent(input, 'input')
    .map(e => input.value)
    .debounceTime(100)
    .concatMap(text => {
      var textCameFromPaste = ((input.getAttribute('pasted') || '') === '1')
      if (!text || /^\s*$/.test(text)) {
        store.dispatch(updateSgt(null))
        store.dispatch(updateTSgt(null))
        return Observable.empty()
      }
      if (text.indexOf('\n') === -1 && !textCameFromPaste && text.length < 50) {
        let from = store.getState().langs.from
        return Observable
          .fromPromise(complete(text, from))
          .catch(err => {
            console.error(err)
            return Observable.empty()
          })
      }
      return Observable.empty()
    })
    .concatMap(res => {
      store.dispatch(updateSgt(res))
      let langs = {
        from: store.getState().langs.from,
        to: store.getState().langs.to
      }
      handleAutocomplete()
      return Observable
        .fromPromise(translateComplete(res, langs))
        .catch(err => {
          console.error(err)
          return Observable.empty()
        })
    })
    .subscribe(r => {
      let x = Array.isArray(r) ? r : [r]
      store.dispatch(updateTSgt(x))
    })
}

function handleAutocomplete() {
  var text = input.value
  var sgt = store.getState().suggest ? store.getState().suggest.sgt[0] : ''
  var isUppercase = /[A-Z]/.test(text)
  var hasDoubleSpace = /\s\s+/.test(text)
  if (!text || isUppercase || !sgt || hasDoubleSpace || text[0] === ' ') {
    autocomplete.value = ''
  } else {
    autocomplete.value = sgt
  }
}

export const searchTranslation = (text) => {

  let langs = {
    from: store.getState().langs.from,
    to: store.getState().langs.to
  }

  translate(text, langs).then(obj => {
    store.dispatch(updateObj(obj))
    store.dispatch(speedFrom(false))
    store.dispatch(speedTo(false))
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
    searchTranslation(text)
  }
}

export const saveSettings = () => {
  var s = store.getState()
  var obj = {
    langs: s.langs,
    speed: s.speed,
    fromActive: s.fromActive,
    toActive: s.toActive,
    fromBar: s.fromBar,
    toBar: s.toBar,
    isTransparent: s.isTransparent
  }
  settings.set('settings', obj)
}
